import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { HowItWorks, ServiceCategories, WhyVuelix } from "@/components/Sections";

const Index = () => {
  // Public landing page - always shows marketing content
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <HowItWorks />
      <ServiceCategories />
      <WhyVuelix />
    </div>
  );
};

export default Index;