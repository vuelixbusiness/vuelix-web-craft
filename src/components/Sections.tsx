import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Users, DollarSign, TrendingUp, Target, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple steps to connect artists with content creators for authentic music promotion.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* For Artists */}
          <div>
            <h3 className="text-3xl font-bold mb-8 flex items-center">
              <Music className="h-8 w-8 text-primary mr-3" />
              For Music Artists
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Create Your Campaign</h4>
                  <p className="text-muted-foreground">Upload your track, set your budget, and define your payout rate per 1k views.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Creators Apply</h4>
                  <p className="text-muted-foreground">Content creators discover your campaign and submit their short-form videos.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Track & Pay</h4>
                  <p className="text-muted-foreground">Monitor performance in real-time and automatically pay creators based on views.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* For Creators */}
          <div>
            <h3 className="text-3xl font-bold mb-8 flex items-center">
              <Users className="h-8 w-8 text-primary mr-3" />
              For Content Creators
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Browse Campaigns</h4>
                  <p className="text-muted-foreground">Discover music campaigns that match your content style and audience.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Create Content</h4>
                  <p className="text-muted-foreground">Use the artist's track in your TikTok, Instagram, or YouTube Shorts videos.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Get Paid</h4>
                  <p className="text-muted-foreground">Submit your video and earn money automatically based on your view count.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ForArtists = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartCampaign = () => {
    if (user) {
      navigate('/artist-campaign');
    } else {
      navigate('/login');
    }
  };

  const benefits = [
    {
      icon: Target,
      title: "Organic Reach",
      description: "Get authentic promotion through real creators and their engaged audiences."
    },
    {
      icon: DollarSign,
      title: "Performance-Based",
      description: "Only pay for actual views, ensuring your budget delivers real results."
    },
    {
      icon: TrendingUp,
      title: "Viral Potential",
      description: "Tap into the viral nature of short-form content across multiple platforms."
    }
  ];

  return (
    <section id="for-artists" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            For Music
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Artists</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Promote your music organically through authentic short-form content creators.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-8 hover:shadow-elegant transition-smooth hover:scale-105 bg-card border-0 shadow-soft">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="hero" size="lg" onClick={handleStartCampaign}>
            Start Your Campaign
          </Button>
        </div>
      </div>
    </section>
  );
};

const ForCreators = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Per View",
      description: "Get paid for every 1k views your videos generate across all platforms."
    },
    {
      icon: Zap,
      title: "Quick Turnaround",
      description: "Fast approval process and instant payments once your content goes live."
    },
    {
      icon: Music,
      title: "Quality Music",
      description: "Access trending tracks and work with emerging and established artists."
    }
  ];

  return (
    <section id="for-creators" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            For Content
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Creators</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monetize your short-form content by promoting great music to your audience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-8 hover:shadow-elegant transition-smooth hover:scale-105 bg-card border-0 shadow-soft">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="outline-hero" size="lg">
            Browse Campaigns
          </Button>
        </div>
      </div>
    </section>
  );
};

export { HowItWorks, ForArtists, ForCreators };