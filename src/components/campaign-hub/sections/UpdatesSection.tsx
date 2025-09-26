import ActivityFeed from "@/components/campaign-join/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Megaphone, TrendingUp } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
}

interface UpdatesSectionProps {
  campaign: Campaign;
}

// Mock announcements data
const mockAnnouncements = [
  {
    id: "1",
    title: "Campaign Performance Update",
    content: "Great news! This campaign has received over 1M views across all submissions. Keep up the excellent work!",
    type: "performance",
    timestamp: "2024-01-15T12:00:00Z",
    priority: "high"
  },
  {
    id: "2", 
    title: "New Submission Guidelines",
    content: "Please ensure all TikTok submissions include the #VuelixChallenge hashtag for proper tracking.",
    type: "guideline",
    timestamp: "2024-01-14T09:30:00Z", 
    priority: "medium"
  },
  {
    id: "3",
    title: "Payout Schedule Update", 
    content: "Payouts for this campaign will be processed on January 20th. Make sure your payment details are up to date.",
    type: "payout",
    timestamp: "2024-01-13T16:45:00Z",
    priority: "high"
  }
];

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case "performance": return TrendingUp;
    case "guideline": return Bell;
    case "payout": return Megaphone;
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
          {mockAnnouncements.map((announcement) => {
            const Icon = getAnnouncementIcon(announcement.type);
            
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
                    {announcement.content}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
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