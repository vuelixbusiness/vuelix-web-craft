import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ExtendedNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'campaign' | 'payout' | 'system' | 'message';
  metadata: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifs = data as ExtendedNotification[] || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error('Failed to mark notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  }, [user?.id, unreadCount, toast]);

  // Delete read notifications
  const deleteAllRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => !notif.read));

      toast({
        title: "Success",
        description: "Read notifications deleted",
      });
    } catch (error: any) {
      console.error('Failed to delete notifications:', error);
      toast({
        title: "Error",
        description: "Failed to delete notifications",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  // Show toast for high priority notifications
  const showToastForNotification = useCallback((notification: ExtendedNotification) => {
    if (notification.priority === 'high' || notification.priority === 'critical') {
      toast({
        title: notification.type === 'campaign_join' ? '🎉 New Participant!' : 
               notification.type === 'status_update' ? '📋 Status Update' :
               notification.type === 'payout_processed' ? '💰 Payment Received' : 
               '📢 Notification',
        description: notification.message,
        variant: notification.priority === 'critical' ? 'destructive' : 'default',
      });
    }
  }, [toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // Set up real-time notifications
    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as ExtendedNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          showToastForNotification(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as ExtendedNotification;
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
          // Update unread count if read status changed
          const oldNotification = payload.old as ExtendedNotification;
          if (!oldNotification.read && updatedNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          } else if (oldNotification.read && !updatedNotification.read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications, showToastForNotification]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteAllRead,
    refresh: fetchNotifications
  };
};