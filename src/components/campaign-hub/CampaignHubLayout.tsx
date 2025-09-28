import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CampaignSidebar } from "./CampaignSidebar";
import { CampaignOverviewSection } from "./sections/CampaignOverviewSection";
import { RulesSection } from "./sections/RulesSection";
import { RewardsSection } from "./sections/RewardsSection";
import { SubmissionsSection } from "./sections/SubmissionsSection";
import { CommunicationSection } from "./sections/CommunicationSection";
import { UpdatesSection } from "./sections/UpdatesSection";
import { LockedSectionPlaceholder } from "./LockedSectionPlaceholder";

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

interface Participation {
  id: string;
  status: string;
  created_at: string;
  payout_amount?: number;
  payout_claimed?: boolean;
  payout_claimed_at?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface CampaignHubLayoutProps {
  campaign: Campaign;
  participation?: Participation;
  mediaAssets?: MediaAsset[];
  onBack: () => void;
  onSubmissionComplete?: () => void;
  onJoinCampaign?: (campaign: Campaign) => void;
}

export function CampaignHubLayout({ 
  campaign, 
  participation, 
  mediaAssets = [],
  onBack,
  onSubmissionComplete,
  onJoinCampaign 
}: CampaignHubLayoutProps) {
  const [activeSection, setActiveSection] = useState<CampaignSectionType>("overview");

  const renderActiveSection = () => {
    const isLocked = !participation && ["submissions", "communication", "updates", "rewards"].includes(activeSection);
    
    if (isLocked) {
      const sectionTitles = {
        submissions: "Join Campaign to Upload Content",
        communication: "Join Campaign to Chat",
        updates: "Join Campaign to View Updates",
        rewards: "Join Campaign to View Rewards"
      };
      
      const sectionDescriptions = {
        submissions: "Upload your content and track submission status once you join the campaign.",
        communication: "Chat with the artist and other participants in this campaign.",
        updates: "View campaign announcements and activity timeline.",
        rewards: "Compare your performance with other creators and track your earnings."
      };
      
      return (
        <LockedSectionPlaceholder
          title={sectionTitles[activeSection as keyof typeof sectionTitles]}
          description={sectionDescriptions[activeSection as keyof typeof sectionDescriptions]}
          campaign={campaign}
          onJoinCampaign={onJoinCampaign}
        />
      );
    }

    switch (activeSection) {
      case "overview":
        return <CampaignOverviewSection campaign={campaign} participation={participation} mediaAssets={mediaAssets} onJoinCampaign={onJoinCampaign} />;
      case "rules":
        return <RulesSection campaign={campaign} />;
      case "rewards":
        return <RewardsSection campaign={campaign} participation={participation} />;
      case "submissions":
        return <SubmissionsSection campaign={campaign} onSubmissionComplete={onSubmissionComplete} />;
      case "communication":
        return <CommunicationSection campaign={campaign} />;
      case "updates":
        return <UpdatesSection campaign={campaign} />;
      default:
        return <CampaignOverviewSection campaign={campaign} participation={participation} mediaAssets={mediaAssets} onJoinCampaign={onJoinCampaign} />;
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
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <CampaignSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              campaign={campaign}
              participation={participation}
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