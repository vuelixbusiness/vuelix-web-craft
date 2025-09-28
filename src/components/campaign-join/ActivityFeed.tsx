import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  Eye,
  MessageSquare,
  Award
} from "lucide-react";

interface ActivityItem {
  id: string;
  activity_type: string;
  title: string;
  message: string;
  created_at: string;
  priority: string;
  metadata?: any;
}

interface ActivityFeedProps {
  campaignId: string;
}

const activityIcons = {
  submission_approved: <CheckCircle className="w-4 h-4 text-green-600" />,
  milestone_reached: <Award className="w-4 h-4 text-gold-600" />,
  payout_processed: <DollarSign className="w-4 h-4 text-green-600" />,
  creator_joined: <Users className="w-4 h-4 text-blue-600" />,
  views_updated: <Eye className="w-4 h-4 text-blue-500" />,
  trending: <TrendingUp className="w-4 h-4 text-orange-600" />,
  message: <MessageSquare className="w-4 h-4 text-purple-600" />,
  campaign_updated: <TrendingUp className="w-4 h-4 text-blue-600" />,
  campaign_paused: <Clock className="w-4 h-4 text-yellow-600" />,
  campaign_resumed: <CheckCircle className="w-4 h-4 text-green-600" />,
  campaign_terminated: <Bell className="w-4 h-4 text-red-600" />,
  default: <Bell className="w-4 h-4 text-muted-foreground" />
};

const activityColors = {
  submission_approved: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
  milestone_reached: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20", 
  payout_processed: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
  creator_joined: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  views_updated: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  trending: "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20",
  message: "border-l-purple-500 bg-purple-50 dark:bg-purple-950/20",
  campaign_updated: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  campaign_paused: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  campaign_resumed: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
  campaign_terminated: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  default: "border-l-gray-300 bg-gray-50 dark:bg-gray-950/20"
};

export default function ActivityFeed({ campaignId }: ActivityFeedProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    // Set up real-time subscription for campaign activities
    const channel = supabase
      .channel('campaign-activities-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_activities',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          const newActivity = payload.new as ActivityItem;
          setActivities(prev => [newActivity, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, user?.id]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_activities')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-secondary/20 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-secondary/20 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Activity Feed
          </div>
          <Badge variant="outline" className="text-primary">
            {activities.length} updates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-3">
            {activities.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activities yet</p>
                <p className="text-sm">Campaign activities will appear here</p>
              </div>
            ) : (
              activities.map((activity) => {
                const icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || activityIcons.default;
                const colorClass = activityColors[activity.activity_type as keyof typeof activityColors] || activityColors.default;
                
                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${colorClass} transition-all hover:shadow-sm`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Activities are updated in real-time
          </p>
        </div>
      </CardContent>
    </Card>
  );
}