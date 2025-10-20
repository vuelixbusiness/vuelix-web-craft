import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Users, DollarSign, TrendingUp, Target, Zap, Briefcase, Lightbulb, Video, Palette, Headphones, Keyboard, Mic, Tag, Sliders, CheckCircle, Globe, BarChart3, UsersRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How Vuelix
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A marketplace where creative innovators reward each other for valuable services
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Service Providers */}
          <div>
            <h3 className="text-3xl font-bold mb-8 flex items-center">
              <Lightbulb className="h-8 w-8 text-primary mr-3" />
              For Service Providers
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Define Your Service</h4>
                  <p className="text-muted-foreground">Set up what you need - video editing, beat production, mix mastering, design work, content creation, or any creative service</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Set Your Reward</h4>
                  <p className="text-muted-foreground">Choose your reward structure: performance-based ($/1k views), fixed-rate, or hybrid rewards for completed work</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Track & Pay</h4>
                  <p className="text-muted-foreground">Monitor submissions, approve quality work, and automatically reward service providers based on performance or completion</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Service Seekers */}
          <div>
            <h3 className="text-3xl font-bold mb-8 flex items-center">
              <Briefcase className="h-8 w-8 text-primary mr-3" />
              For Service Seekers
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Discover Opportunities</h4>
                  <p className="text-muted-foreground">Browse campaigns across all creative categories - music, video, design, production, events, and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Deliver Your Skill</h4>
                  <p className="text-muted-foreground">Apply your creative expertise and submit your work - whether it's a video, beat, design, mix, or other service</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Get Rewarded</h4>
                  <p className="text-muted-foreground">Receive instant payments based on performance metrics or upon completion and approval of your work</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ServiceCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      icon: Music,
      title: "Music & Audio",
      description: "Beat production, mixing, mastering, remixes",
      subtitle: "Launch campaigns for tracks or provide audio services"
    },
    {
      icon: Video,
      title: "Video Content",
      description: "Video editing, short-form content, promotional videos",
      subtitle: "Create or produce engaging video content"
    },
    {
      icon: Palette,
      title: "Visual Design",
      description: "Cover art, branding, posters, social media graphics",
      subtitle: "Design campaigns or offer visual creative services"
    },
    {
      icon: Headphones,
      title: "DJing & Live Sets",
      description: "Set recordings, track showcases, live event promotion",
      subtitle: "Promote your sets or feature tracks in performances"
    },
    {
      icon: Keyboard,
      title: "Production & Engineering",
      description: "Beat making, sound design, audio engineering",
      subtitle: "Collaborate on productions or offer technical expertise"
    },
    {
      icon: Mic,
      title: "Event Promotion",
      description: "Festival marketing, event coverage, artist bookings",
      subtitle: "Promote events or provide event-related services"
    },
    {
      icon: Tag,
      title: "Brand Collaborations",
      description: "Sponsored content, brand partnerships, product integration",
      subtitle: "Launch brand campaigns or partner with brands"
    },
    {
      icon: Sliders,
      title: "Recording Services",
      description: "Studio time, recording sessions, mixing services",
      subtitle: "Offer studio services or book recording sessions"
    }
  ];

  return (
    <section id="service-categories" className="py-24 bg-gradient-to-b from-purple-100 to-purple-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Services Across the
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Creative Spectrum</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From music production to visual content, discover and offer services in every creative field
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index} className="p-6 hover:shadow-elegant transition-smooth hover:scale-105 bg-card border-0 shadow-soft">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
              <p className="text-xs text-muted-foreground italic">{category.subtitle}</p>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="hero" size="lg" onClick={() => navigate('/campaigns')}>
            Explore All Services
          </Button>
        </div>
      </div>
    </section>
  );
};

const WhyVuelix = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: DollarSign,
      title: "Fair Compensation",
      description: "Set your own rates and get paid what you're worth. Performance-based or fixed-rate options available."
    },
    {
      icon: Globe,
      title: "Diverse Opportunities",
      description: "Access services across music, video, design, and more. Work with talents from around the globe."
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Get paid immediately when work is approved. Secure payment processing via Stripe/PayPal."
    },
    {
      icon: CheckCircle,
      title: "Quality Control",
      description: "Approval systems ensure both parties are satisfied. Build reputation through successful collaborations."
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Real-time analytics for view-based campaigns. Track engagement and earnings in one place."
    },
    {
      icon: UsersRound,
      title: "Community Network",
      description: "Connect with fellow creatives across disciplines. Build partnerships and long-term collaborations."
    }
  ];

  return (
    <section id="why-vuelix" className="py-24 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Creative Innovators</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A platform designed to reward creativity and skills across all disciplines
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
          <Button variant="outline-hero" size="lg" onClick={() => navigate('/signup')}>
            Join the Community
          </Button>
        </div>
      </div>
    </section>
  );
};

export { HowItWorks, ServiceCategories, WhyVuelix };