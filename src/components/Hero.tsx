import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Music, Video, DollarSign } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-bg.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const trendingCampaigns = [
  {
    id: 1,
    title: "Midnight Dreams",
    artist: "Aria Moon",
    genre: "Indie Pop",
    views: "4.8M",
    rate: "$25/1k views",
    trending: true,
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Electric Soul",
    artist: "DJ Phoenix",
    genre: "Electronic",
    views: "3.2M",
    rate: "$22/1k views",
    trending: true,
    image: "/placeholder.svg"
  },
  {
    id: 3,
    title: "Golden Hour",
    artist: "Sunset Valley",
    genre: "Acoustic",
    views: "5.1M",
    rate: "$28/1k views",
    trending: true,
    image: "/placeholder.svg"
  },
  {
    id: 4,
    title: "City Lights",
    artist: "Urban Echo",
    genre: "Hip-Hop",
    views: "6.7M",
    rate: "$30/1k views",
    trending: true,
    image: "/placeholder.svg"
  },
  {
    id: 5,
    title: "Ocean Waves",
    artist: "Blue Horizon",
    genre: "Chill",
    views: "2.9M",
    rate: "$20/1k views",
    trending: true,
    image: "/placeholder.svg"
  },
  {
    id: 6,
    title: "Fire & Ice",
    artist: "Storm Riders",
    genre: "Rock",
    views: "4.3M",
    rate: "$26/1k views",
    trending: true,
    image: "/placeholder.svg"
  }
];

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartCampaign = () => {
    if (user) {
      navigate('/artist-campaign');
    } else {
      navigate('/login');
    }
  };

  const handleBrowseCampaigns = () => {
    if (user) {
      navigate('/creator-flow');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-background">
      {/* Content */}
      <div className="container mx-auto px-4 py-32">
        <div className="text-center max-w-5xl mx-auto">
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Connect. Create. Earn.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Artists promote their brand. Creators earn off clipping.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            {/* For Artists */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-soft flex flex-col">
              <div className="flex items-center mb-4">
                <Music className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold">For Artists</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Launch campaigns with your tracks and pay creators per 1k views to promote your music organically.
              </p>
              <Button variant="default" className="w-full mt-auto" onClick={handleStartCampaign}>
                Start Campaign
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            {/* For Creators */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-soft flex flex-col">
              <div className="flex items-center mb-4">
                <Video className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold">For Creators</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Submit your short-form content to music campaigns and earn money based on your video performance.
              </p>
              <Button variant="default" className="w-full mt-auto" onClick={handleBrowseCampaigns}>
                Browse Campaigns
                <DollarSign className="ml-2 h-5 w-5" />
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
          
          {/* Trending Artist Campaigns Carousel */}
          <div className="mt-20">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">Trending Artist Campaigns</h3>
            <div className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 3000,
                  })
                ]}
                className="w-full"
              >
                <CarouselContent className="animate-fade-in">
                  {trendingCampaigns.map((campaign) => (
                    <CarouselItem key={campaign.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:border-primary/30 cursor-pointer group">
                        {/* Trending Badge */}
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          TRENDING
                        </div>
                        <div className="flex items-start space-x-4">
                          <img 
                            src={campaign.image} 
                            alt={campaign.title}
                            className="w-16 h-16 rounded-lg object-cover bg-muted"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg leading-tight mb-1 truncate">{campaign.title}</h4>
                            <p className="text-muted-foreground text-sm mb-2 font-medium">by {campaign.artist}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">{campaign.genre}</span>
                              <span className="text-muted-foreground font-semibold">{campaign.views} views</span>
                            </div>
                            <div className="mt-3 text-lg font-bold text-primary">{campaign.rate}</div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;