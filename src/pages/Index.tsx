import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { CampaignThumbnails } from "@/components/CampaignThumbnails";
import { HowItWorks, ForArtists, ForCreators } from "@/components/Sections";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <CampaignThumbnails />
      <HowItWorks />
      <ForArtists />
      <ForCreators />
    </div>
  );
};

export default Index;