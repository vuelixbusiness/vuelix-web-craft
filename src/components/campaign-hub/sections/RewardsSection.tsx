import EarningsTracker from "@/components/campaign-join/EarningsTracker";

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

interface Participation {
  id: string;
  status: string;
}

interface RewardsSectionProps {
  campaign: Campaign;
  participation?: Participation;
}

export function RewardsSection({ campaign, participation }: RewardsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Rewards & Earnings</h2>
        <p className="text-muted-foreground">
          Track your performance and earnings for this campaign.
        </p>
      </div>

      <EarningsTracker campaign={campaign} />
    </div>
  );
}