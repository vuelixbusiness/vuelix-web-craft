import SubmissionTabs from "@/components/campaign-join/SubmissionTabs";

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

interface SubmissionsSectionProps {
  campaign: Campaign;
  onSubmissionComplete?: () => void;
}

export function SubmissionsSection({ campaign, onSubmissionComplete }: SubmissionsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Submissions</h2>
        <p className="text-muted-foreground">
          Upload your content and track submission status.
        </p>
      </div>

      <SubmissionTabs 
        campaign={campaign} 
        onSubmissionComplete={onSubmissionComplete} 
      />
    </div>
  );
}