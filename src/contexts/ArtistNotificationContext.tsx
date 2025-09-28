import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ArtistNotificationData {
  campaignUpdates: Record<string, {
    newSubmissions: number;
    statusChanges: number;
    newMessages: number;
  }>;
  totalCount: number;
  lastChecked: Date;
}

interface ArtistNotificationContextType {
  notificationData: ArtistNotificationData;
  hasNotifications: boolean;
  clearAllNotifications: () => void;
  clearCampaignNotifications: (campaignId: string) => void;
  markArtistDashboardVisited: () => void;
}

const ArtistNotificationContext = createContext<ArtistNotificationContextType | undefined>(undefined);

export const useArtistNotifications = () => {
  const context = useContext(ArtistNotificationContext);
  if (!context) {
    throw new Error('useArtistNotifications must be used within an ArtistNotificationProvider');
  }
  return context;
};

export const ArtistNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notificationData, setNotificationData] = useState<ArtistNotificationData>({
    campaignUpdates: {},
    totalCount: 0,
    lastChecked: new Date()
  });

  // Load notification state from localStorage
  const loadNotificationState = useCallback(() => {
    if (!user?.id) return;
    
    const stored = localStorage.getItem(`artist_notifications_${user.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotificationData({
          ...parsed,
          lastChecked: new Date(parsed.lastChecked)
        });
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
      }
    }
  }, [user?.id]);

  // Save notification state to localStorage
  const saveNotificationState = useCallback((data: ArtistNotificationData) => {
    if (!user?.id) return;
    localStorage.setItem(`artist_notifications_${user.id}`, JSON.stringify(data));
  }, [user?.id]);

  // Update notification count
  const updateNotificationData = useCallback((updater: (prev: ArtistNotificationData) => ArtistNotificationData) => {
    setNotificationData(prev => {
      const newData = updater(prev);
      saveNotificationState(newData);
      return newData;
    });
  }, [saveNotificationState]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    updateNotificationData(prev => ({
      campaignUpdates: {},
      totalCount: 0,
      lastChecked: new Date()
    }));
  }, [updateNotificationData]);

  // Clear notifications for a specific campaign
  const clearCampaignNotifications = useCallback((campaignId: string) => {
    updateNotificationData(prev => {
      const newCampaignUpdates = { ...prev.campaignUpdates };
      delete newCampaignUpdates[campaignId];
      
      const newTotalCount = Object.values(newCampaignUpdates).reduce(
        (sum, campaign) => sum + campaign.newSubmissions + campaign.statusChanges + campaign.newMessages, 
        0
      );

      return {
        ...prev,
        campaignUpdates: newCampaignUpdates,
        totalCount: newTotalCount
      };
    });
  }, [updateNotificationData]);

  // Mark artist dashboard as visited
  const markArtistDashboardVisited = useCallback(() => {
    updateNotificationData(prev => ({
      ...prev,
      lastChecked: new Date()
    }));
  }, [updateNotificationData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    loadNotificationState();

    // Subscribe to campaign participation changes (new submissions, status changes)
    const participationChannel = supabase
      .channel('artist-participation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_participations'
        },
        async (payload) => {
          console.log('🔔 Campaign participation update:', payload);
          
          // Check if this participation belongs to the artist's campaign
          if (payload.new && (payload.new as any).campaign_id) {
            const campaignId = (payload.new as any).campaign_id;
            const { data: campaign } = await supabase
              .from('campaigns')
              .select('artist_id')
              .eq('id', campaignId)
              .eq('artist_id', user.id)
              .single();
            
            if (campaign) {
              
              updateNotificationData(prev => {
                const campaignUpdates = { ...prev.campaignUpdates };
                if (!campaignUpdates[campaignId]) {
                  campaignUpdates[campaignId] = { newSubmissions: 0, statusChanges: 0, newMessages: 0 };
                }
                
                if (payload.eventType === 'INSERT') {
                  campaignUpdates[campaignId].newSubmissions += 1;
                } else if (payload.eventType === 'UPDATE' && (payload.old as any)?.status !== (payload.new as any)?.status) {
                  campaignUpdates[campaignId].statusChanges += 1;
                }
                
                const newTotalCount = Object.values(campaignUpdates).reduce(
                  (sum, campaign) => sum + campaign.newSubmissions + campaign.statusChanges + campaign.newMessages,
                  0
                );
                
                return {
                  ...prev,
                  campaignUpdates,
                  totalCount: newTotalCount
                };
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to message changes for campaign chat rooms
    const messageChannel = supabase
      .channel('artist-message-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('🔔 New message update:', payload);
          
          // Check if message is from a campaign chat room belonging to this artist
          if (payload.new && payload.new.room_id && payload.new.sender_id !== user.id) {
            const { data: room } = await supabase
              .from('chat_rooms')
              .select('name')
              .eq('id', payload.new.room_id)
              .single();
              
            if (room && room.name?.startsWith('campaign_')) {
              // Extract campaign ID from room name
              const campaignIdMatch = room.name.match(/campaign_([a-f0-9-]{36})/);
              if (campaignIdMatch) {
                const campaignId = campaignIdMatch[1];
                
                // Verify this is the artist's campaign
                const { data: campaign } = await supabase
                  .from('campaigns')
                  .select('artist_id')
                  .eq('id', campaignId)
                  .eq('artist_id', user.id)
                  .single();
                  
                if (campaign) {
                  updateNotificationData(prev => {
                    const campaignUpdates = { ...prev.campaignUpdates };
                    if (!campaignUpdates[campaignId]) {
                      campaignUpdates[campaignId] = { newSubmissions: 0, statusChanges: 0, newMessages: 0 };
                    }
                    
                    campaignUpdates[campaignId].newMessages += 1;
                    
                    const newTotalCount = Object.values(campaignUpdates).reduce(
                      (sum, campaign) => sum + campaign.newSubmissions + campaign.statusChanges + campaign.newMessages,
                      0
                    );
                    
                    return {
                      ...prev,
                      campaignUpdates,
                      totalCount: newTotalCount
                    };
                  });
                }
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [user?.id, loadNotificationState, updateNotificationData]);

  const hasNotifications = notificationData.totalCount > 0;

  return (
    <ArtistNotificationContext.Provider value={{
      notificationData,
      hasNotifications,
      clearAllNotifications,
      clearCampaignNotifications,
      markArtistDashboardVisited
    }}>
      {children}
    </ArtistNotificationContext.Provider>
  );
};