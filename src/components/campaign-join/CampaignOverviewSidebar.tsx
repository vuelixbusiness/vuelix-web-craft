import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Eye, 
  Music,
  Target,
  Clock
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  cover_art_url?: string;
  payout_type: string;
  payout_rate: number;
  platforms: string[];
  instructions: string;
  rules?: string;
  budget?: number;
  end_date?: string;
  status?: string;
  genre?: string;
}

interface CampaignOverviewSidebarProps {
  campaign: Campaign;
}

const platformIcons = {
  tiktok: <FaTiktok className="w-4 h-4" />,
  instagram: <FaInstagram className="w-4 h-4" />,
  youtube: <FaYoutube className="w-4 h-4" />
};

const platformNames = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube"
};

export default function CampaignOverviewSidebar({ campaign }: CampaignOverviewSidebarProps) {
  const budgetSpent = Math.floor((campaign.budget || 0) * 0.65); // Mock data
  const budgetProgress = campaign.budget ? (budgetSpent / campaign.budget) * 100 : 0;
  const daysRemaining = campaign.end_date 
    ? Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Cover Art */}
            {campaign.cover_art_url && (
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-secondary/20">
                <img 
                  src={campaign.cover_art_url} 
                  alt={campaign.song_title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Title & Artist */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">{campaign.song_title}</h2>
              <p className="text-muted-foreground">{campaign.title}</p>
              {campaign.genre && (
                <Badge variant="outline" className="mt-2">
                  <Music className="w-3 h-3 mr-1" />
                  {campaign.genre}
                </Badge>
              )}
            </div>

            {/* Platform Support */}
            <div className="flex flex-wrap gap-2 justify-center">
              {campaign.platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="flex items-center gap-1">
                  {platformIcons[platform as keyof typeof platformIcons]}
                  <span>{platformNames[platform as keyof typeof platformNames]}</span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reward Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reward</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">
                  ${campaign.payout_rate} per 1,000 Views
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Budget Progress */}
          {campaign.budget && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Budget Used</span>
                <span className="text-sm font-medium">
                  ${budgetSpent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                </span>
              </div>
              <Progress value={budgetProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(100 - budgetProgress)}% remaining
              </p>
            </div>
          )}

          <Separator />

          {/* Timeline */}
          {daysRemaining !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time Remaining</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium">
                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Ended'}
                </span>
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Participants</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium">247 creators</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions & Rules */}
      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {campaign.instructions && (
              <AccordionItem value="instructions">
                <AccordionTrigger className="text-sm font-medium">
                  Campaign Instructions
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {campaign.instructions}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {campaign.rules && (
              <AccordionItem value="rules">
                <AccordionTrigger className="text-sm font-medium">
                  Campaign Rules
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {campaign.rules}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}