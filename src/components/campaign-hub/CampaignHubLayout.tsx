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

interface CampaignHubLayoutProps {
  campaign: Campaign;
  participation?: Participation;
  onBack: () => void;
  onSubmissionComplete?: () => void;
}

export function CampaignHubLayout({ 
  campaign, 
  participation, 
  onBack,
  onSubmissionComplete 
}: CampaignHubLayoutProps) {
  const [activeSection, setActiveSection] = useState<CampaignSectionType>("overview");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <CampaignOverviewSection campaign={campaign} participation={participation} />;
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
        return <CampaignOverviewSection campaign={campaign} participation={participation} />;
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
          <CampaignSidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            campaign={campaign}
            participation={participation}
          />

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}