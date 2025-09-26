import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  payout_type: string;
  payout_rate: number;
  vip_bonus?: number;
  platforms: string[];
  budget: number;
  end_date?: string;
  created_at: string;
  cover_art_url?: string;
  genre: string;
  status: string;
}

interface Participation {
  id: string;
  status: string;
  created_at: string;
}

interface CampaignOverviewSectionProps {
  campaign: Campaign;
  participation?: Participation;
}

const platformIcons: Record<string, string> = {
  tiktok: "🎵",
  youtube: "📺", 
  instagram: "📷",
  twitter: "🐦",
  spotify: "🎧"
};

const platformNames: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram", 
  twitter: "Twitter",
  spotify: "Spotify"
};

export function CampaignOverviewSection({ campaign, participation }: CampaignOverviewSectionProps) {
  const budgetSpent = campaign.budget * 0.65; // Mock data
  const budgetProgress = (budgetSpent / campaign.budget) * 100;
  const daysRemaining = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 rounded-xl">
              <AvatarImage src={campaign.cover_art_url} alt={campaign.title} />
              <AvatarFallback className="rounded-xl text-lg">
                {campaign.title.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{campaign.title}</h1>
                <p className="text-xl text-muted-foreground">{campaign.song_title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{campaign.genre}</Badge>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    ${campaign.payout_rate} {campaign.payout_type === 'per_view' ? 'per 1K views' : 'per submission'}
                  </span>
                  {campaign.vip_bonus && (
                    <Badge variant="outline" className="text-xs">
                      +${campaign.vip_bonus} VIP bonus
                    </Badge>
                  )}
                </div>
                {daysRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Campaign ended'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${budgetSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              of ${campaign.budget.toLocaleString()} total
            </p>
            <Progress value={budgetProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              creators joined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              submission approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {campaign.platforms.map((platform) => (
              <Badge key={platform} variant="outline" className="flex items-center gap-2 px-3 py-2">
                <span className="text-base">{platformIcons[platform] || "📱"}</span>
                <span>{platformNames[platform] || platform}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Participation Status */}
      {participation && (
        <Card>
          <CardHeader>
            <CardTitle>Your Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Joined on {new Date(participation.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Current status: {participation.status}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {participation.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}