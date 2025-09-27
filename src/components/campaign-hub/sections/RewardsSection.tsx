import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EarningsTracker from "@/components/campaign-join/EarningsTracker";
import { CampaignLeaderboard } from "./CampaignLeaderboard";

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
        <h2 className="text-2xl font-bold mb-2">Rewards & Leaderboard</h2>
        <p className="text-muted-foreground">
          Compare your performance with other creators and track your earnings.
        </p>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="earnings">My Earnings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leaderboard" className="mt-6">
          <CampaignLeaderboard campaign={campaign} />
        </TabsContent>
        
        <TabsContent value="earnings" className="mt-6">
          <EarningsTracker campaign={campaign} />
        </TabsContent>
      </Tabs>
    </div>
  );
}