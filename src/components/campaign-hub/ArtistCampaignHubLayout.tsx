import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CampaignSidebar } from "./CampaignSidebar";
import { CampaignOverviewSection } from "./sections/CampaignOverviewSection";
import { RulesSection } from "./sections/RulesSection";
import { RewardsSection } from "./sections/RewardsSection";
import { CommunicationSection } from "./sections/CommunicationSection";
import { UpdatesSection } from "./sections/UpdatesSection";
import SubmissionsLog from "@/components/campaign-details/SubmissionsLog";

export type CampaignSectionType = 
  | "overview" 
  | "rules" 
  | "rewards" 
  | "submissions" 
  | "communication" 
  | "updates";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
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

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface Submission {
  id: string;
  creator_id: string;
  video_url: string;
  platform: string;
  current_views: number;
  current_likes: number;
  initial_views: number;
  initial_likes: number;
  status: string;
  payout_amount: number;
  payout_claimed: boolean;
  created_at: string;
  last_tracked_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface UniqueParticipant {
  creator_id: string;
  join_date: string;
  submission_count: number;
  platforms: string[];
  primary_platform: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ArtistCampaignHubLayoutProps {
  campaign: Campaign;
  mediaAssets?: MediaAsset[];
  submissions?: Submission[];
  onBack: () => void;
  onSubmissionUpdate?: () => void;
}

export function ArtistCampaignHubLayout({ 
  campaign, 
  mediaAssets = [],
  submissions = [],
  onBack,
  onSubmissionUpdate
}: ArtistCampaignHubLayoutProps) {
  const [activeSection, setActiveSection] = useState<CampaignSectionType>("overview");

  // Helper function to transform submissions into unique participants
  const transformToParticipants = (submissions: Submission[]): UniqueParticipant[] => {
    const participantMap = new Map<string, UniqueParticipant>();
    
    submissions.forEach(submission => {
      const creatorId = submission.creator_id;
      
      if (participantMap.has(creatorId)) {
        const existing = participantMap.get(creatorId)!;
        existing.submission_count++;
        if (!existing.platforms.includes(submission.platform)) {
          existing.platforms.push(submission.platform);
        }
      } else {
        participantMap.set(creatorId, {
          creator_id: creatorId,
          join_date: submission.created_at,
          submission_count: 1,
          platforms: [submission.platform],
          primary_platform: submission.platform,
          profiles: submission.profiles
        });
      }
    });
    
    return Array.from(participantMap.values()).sort((a, b) => 
      new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
    );
  };

  const renderActiveSection = () => {
    // Artists have access to all sections, no locking logic needed
    
    switch (activeSection) {
      case "overview":
        // Mock participation for artists (campaign owners) to unlock all features
        const mockParticipation = {
          id: 'owner',
          status: 'owner',
          created_at: campaign.created_at
        };
        return <CampaignOverviewSection 
          campaign={campaign} 
          mediaAssets={mediaAssets} 
          participation={mockParticipation}
          participants={transformToParticipants(submissions)}
        />;
      case "rules":
        return <RulesSection campaign={campaign} />;
      case "rewards":
        return <RewardsSection campaign={campaign} />;
      case "submissions":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Complete Submissions Log</h2>
              <p className="text-muted-foreground">
                Manage all submissions and track performance across your campaign.
              </p>
            </div>

            <SubmissionsLog 
              submissions={submissions} 
              campaignId={campaign.id}
              isArtist={true}
              onSubmissionUpdate={onSubmissionUpdate}
            />
          </div>
        );
      case "communication":
        return <CommunicationSection campaign={campaign} />;
      case "updates":
        return <UpdatesSection campaign={campaign} />;
      default:
        const defaultMockParticipation = {
          id: 'owner',
          status: 'owner',
          created_at: campaign.created_at
        };
        return <CampaignOverviewSection 
          campaign={campaign} 
          mediaAssets={mediaAssets} 
          participation={defaultMockParticipation}
          participants={transformToParticipants(submissions)}
        />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-4 h-full px-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg truncate">{campaign.title}</h1>
              <p className="text-sm text-muted-foreground truncate">{campaign.song_title}</p>
            </div>
          </div>
        </header>

        <div className="flex w-full pt-14">
          {/* Sidebar - Using existing CampaignSidebar but without participation restrictions */}
          <div className="w-80 flex-shrink-0">
            <CampaignSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              campaign={campaign}
              participation={{ 
                status: 'approved'
              }} // Mock participation so all sections are unlocked for artists
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}