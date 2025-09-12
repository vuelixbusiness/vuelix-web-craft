import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { HowItWorks, ForArtists, ForCreators } from "@/components/Sections";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <HowItWorks />
      <ForArtists />
      <ForCreators />
    </div>
  );
};

export default Index;