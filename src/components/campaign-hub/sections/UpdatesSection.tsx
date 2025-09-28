import { useState, useEffect } from "react";
import ActivityFeed from "@/components/campaign-join/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Megaphone, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  payout_type: string;
  payout_rate: number;
  vip_bonus?: number;
  platforms: string[];
  budget?: number;
  end_date?: string;
  created_at: string;
  cover_art_url?: string;
  instructions?: string;
  rules?: string;
  genre?: string;
  status?: string;
}

interface UpdatesSectionProps {
  campaign: Campaign;
}

interface CampaignActivity {
  id: string;
  title: string;
  message: string;
  activity_type: string;
  priority: string;
  created_at: string;
  metadata?: any;
}

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case "campaign_updated": return TrendingUp;
    case "campaign_paused": return Bell;
    case "campaign_resumed": return Bell;
    case "campaign_terminated": return Megaphone;
    default: return Bell;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export function UpdatesSection({ campaign }: UpdatesSectionProps) {
  const [announcements, setAnnouncements] = useState<CampaignActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
    
    // Set up real-time subscription for campaign activities
    const channel = supabase
      .channel('campaign-activities-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_activities',
          filter: `campaign_id=eq.${campaign.id}`
        },
        (payload) => {
          const newActivity = payload.new as CampaignActivity;
          // Only show announcement-worthy activities
          if (['campaign_updated', 'campaign_paused', 'campaign_resumed', 'campaign_terminated'].includes(newActivity.activity_type)) {
            setAnnouncements(prev => [newActivity, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaign.id]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_activities')
        .select('*')
        .eq('campaign_id', campaign.id)
        .in('activity_type', ['campaign_updated', 'campaign_paused', 'campaign_resumed', 'campaign_terminated'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Updates & Timeline</h2>
        <p className="text-muted-foreground">
          Stay updated with campaign announcements and activity.
        </p>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-secondary/20"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary/20 rounded w-3/4"></div>
                    <div className="h-3 bg-secondary/20 rounded w-full"></div>
                    <div className="h-3 bg-secondary/20 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No announcements yet</p>
              <p className="text-sm">Campaign updates will appear here</p>
            </div>
          ) : (
            announcements.map((announcement) => {
              const Icon = getAnnouncementIcon(announcement.activity_type);
              
              return (
                <div key={announcement.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs shrink-0 ${getPriorityColor(announcement.priority)}`}
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {announcement.message}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed campaignId={campaign.id} />
        </CardContent>
      </Card>
    </div>
  );
}