import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Music, Video, DollarSign } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Abstract gradient background" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Connect. Create. Earn.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Artists promote their music organically through short-form content. 
            Creators earn money for views on TikTok, Instagram, and YouTube Shorts.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            {/* For Artists */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-soft">
              <div className="flex items-center mb-4">
                <Music className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold">For Artists</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Launch campaigns with your tracks and pay creators per 1k views to promote your music organically.
              </p>
              <Button variant="hero" className="w-full" asChild>
                <a href="/artist-campaign">
                  Start Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            
            {/* For Creators */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-soft">
              <div className="flex items-center mb-4">
                <Video className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold">For Creators</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Submit your short-form content to music campaigns and earn money based on your video performance.
              </p>
              <Button variant="outline-hero" className="w-full" asChild>
                <a href="/creator-flow">
                  Browse Campaigns
                  <DollarSign className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Free to join
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Instant payments
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Real-time tracking
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-secondary rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-8 h-8 bg-accent rounded-full opacity-40 animate-pulse delay-500"></div>
    </section>
  );
};

export default Hero;