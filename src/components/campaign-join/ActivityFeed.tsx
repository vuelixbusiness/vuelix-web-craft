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
  type: string;
  message: string;
  timestamp: string;
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
  default: <Bell className="w-4 h-4 text-muted-foreground" />
};

const activityColors = {
  submission_approved: "border-l-green-500 bg-green-50",
  milestone_reached: "border-l-yellow-500 bg-yellow-50", 
  payout_processed: "border-l-green-500 bg-green-50",
  creator_joined: "border-l-blue-500 bg-blue-50",
  views_updated: "border-l-blue-500 bg-blue-50",
  trending: "border-l-orange-500 bg-orange-50",
  message: "border-l-purple-500 bg-purple-50",
  default: "border-l-gray-300 bg-gray-50"
};

// Mock activity data - in a real app this would come from a database
const generateMockActivities = (campaignId: string, userId?: string): ActivityItem[] => {
  const now = new Date();
  const activities: ActivityItem[] = [];

  // User-specific activities
  if (userId) {
    activities.push(
      {
        id: '1',
        type: 'submission_approved',
        message: 'Your submission has been approved! 🎉',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', 
        type: 'views_updated',
        message: 'Your video gained 1,234 new views (+15% from yesterday)',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'milestone_reached', 
        message: 'Congratulations! You reached 10K views milestone',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      }
    );
  }

  // Campaign-wide activities
  activities.push(
    {
      id: '4',
      type: 'creator_joined',
      message: '15 new creators joined this campaign today',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      type: 'trending',
      message: 'This campaign is trending! #1 in Hip-Hop category',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      type: 'payout_processed',
      message: '$2,500 in payouts processed to creators today',
      timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '7',
      type: 'creator_joined',
      message: 'Campaign reached 250 participating creators!',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '8',
      type: 'milestone_reached',
      message: 'Campaign surpassed 1M total views across all submissions',
      timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString()
    }
  );

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function ActivityFeed({ campaignId }: ActivityFeedProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from a database
    const mockActivities = generateMockActivities(campaignId, user?.id);
    setActivities(mockActivities);
    setIsLoading(false);
  }, [campaignId, user?.id]);

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
            {activities.map((activity) => {
              const icon = activityIcons[activity.type as keyof typeof activityIcons] || activityIcons.default;
              const colorClass = activityColors[activity.type as keyof typeof activityColors] || activityColors.default;
              
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
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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