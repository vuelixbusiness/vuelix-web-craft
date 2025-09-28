import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface LockedSectionPlaceholderProps {
  title: string;
  description: string;
  campaign: Campaign;
  onJoinCampaign?: (campaign: Campaign) => void;
}

export function LockedSectionPlaceholder({ 
  title, 
  description, 
  campaign, 
  onJoinCampaign 
}: LockedSectionPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 space-y-6">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
        <p className="text-sm text-muted-foreground">
          Join the campaign to access all features and start earning rewards.
        </p>
      </div>

      <Button 
        onClick={() => onJoinCampaign?.(campaign)} 
        variant="default"
        size="lg"
        className="gap-2"
      >
        🔘 Join Campaign
      </Button>
    </div>
  );
}