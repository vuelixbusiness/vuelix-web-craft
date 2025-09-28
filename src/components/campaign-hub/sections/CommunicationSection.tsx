import { CampaignChat } from "./CampaignChat";

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

interface CommunicationSectionProps {
  campaign: Campaign;
  onMessageSent?: () => void;
}

export function CommunicationSection({ campaign, onMessageSent }: CommunicationSectionProps) {
  return <CampaignChat campaign={campaign} onMessageSent={onMessageSent} />;
}