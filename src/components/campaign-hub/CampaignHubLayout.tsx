import { useState, useEffect, useCallback } from "react";
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
import { SectionUpdateProvider, useSectionUpdates, type CampaignSectionType } from "@/contexts/SectionUpdateContext";

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

function CampaignHubLayoutContent({ 
  campaign, 
  participation, 
  mediaAssets = [],
  onBack,
  onSubmissionComplete,
  onJoinCampaign 
}: CampaignHubLayoutProps) {
  const [activeSection, setActiveSection] = useState<CampaignSectionType>("overview");
  const { sectionUpdates, markSectionAsUpdated, markSectionAsRead } = useSectionUpdates();

  // Check URL hash on mount to set active section
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'rules', 'rewards', 'submissions', 'communication', 'updates'].includes(hash)) {
      setActiveSection(hash as CampaignSectionType);
      markSectionAsRead(hash as CampaignSectionType);
    }
  }, [markSectionAsRead]);

  // Create wrapper for communication section updates
  const handleMessageSent = useCallback(() => {
    markSectionAsUpdated("communication");
  }, [markSectionAsUpdated]);

  // Handle section changes and mark as read
  const handleSectionChange = useCallback((section: CampaignSectionType) => {
    setActiveSection(section);
    markSectionAsRead(section);
  }, [markSectionAsRead]);

  // Connect onSubmissionComplete to trigger section updates
  const handleSubmissionComplete = useCallback(() => {
    markSectionAsUpdated("submissions");
    markSectionAsUpdated("overview");
    onSubmissionComplete?.();
  }, [markSectionAsUpdated, onSubmissionComplete]);

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
        return <SubmissionsSection campaign={campaign} onSubmissionComplete={handleSubmissionComplete} />;
      case "communication":
        return <CommunicationSection campaign={campaign} onMessageSent={handleMessageSent} />;
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
              onSectionChange={handleSectionChange}
              campaign={campaign}
              participation={participation}
              sectionUpdates={sectionUpdates}
              onMarkSectionAsRead={markSectionAsRead}
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

export function CampaignHubLayout(props: CampaignHubLayoutProps) {
  return (
    <SectionUpdateProvider campaignId={props.campaign.id}>
      <CampaignHubLayoutContent {...props} />
    </SectionUpdateProvider>
  );
}