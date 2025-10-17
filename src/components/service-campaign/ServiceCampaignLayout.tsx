import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceOverviewSection } from "./sections/ServiceOverviewSection";
import { ServicePortfolioSection } from "./sections/ServicePortfolioSection";
import { ServiceBookingSection } from "./sections/ServiceBookingSection";
import { ServiceReviewsSection } from "./sections/ServiceReviewsSection";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  payout_type: string;
  payout_rate: number;
  starting_rate?: number;
  platforms: string[];
  created_at: string;
  cover_art_url?: string;
  instructions?: string;
  genre?: string;
  status?: string;
  campaign_mode?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface ServiceCampaignLayoutProps {
  campaign: Campaign;
  mediaAssets?: MediaAsset[];
  onBack: () => void;
}

type ServiceSectionType = "overview" | "portfolio" | "booking" | "reviews";

export function ServiceCampaignLayout({ 
  campaign, 
  mediaAssets = [],
  onBack
}: ServiceCampaignLayoutProps) {
  const [activeSection, setActiveSection] = useState<ServiceSectionType>("overview");

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'portfolio', 'booking', 'reviews'].includes(hash)) {
      setActiveSection(hash as ServiceSectionType);
    }
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <ServiceOverviewSection campaign={campaign} mediaAssets={mediaAssets} />;
      case "portfolio":
        return <ServicePortfolioSection campaign={campaign} mediaAssets={mediaAssets} />;
      case "booking":
        return <ServiceBookingSection campaign={campaign} />;
      case "reviews":
        return <ServiceReviewsSection campaign={campaign} />;
      default:
        return <ServiceOverviewSection campaign={campaign} mediaAssets={mediaAssets} />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
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
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <h1 className="font-semibold text-base truncate leading-tight">{campaign.title}</h1>
            <p className="text-xs text-muted-foreground truncate leading-tight">Service Offering</p>
          </div>
        </div>
      </header>

      <div className="flex w-full pt-16">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0 border-r border-border p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection("overview")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === "overview" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection("portfolio")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === "portfolio" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveSection("booking")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === "booking" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              Request Service
            </button>
            <button
              onClick={() => setActiveSection("reviews")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === "reviews" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
