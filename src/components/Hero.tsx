import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Video, DollarSign } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import vuelixLogo from "@/assets/vuelix-logo.png";

interface Campaign {
  id: string;
  song_title: string;
  title: string;
  genre: string;
  cover_art_url: string | null;
  payout_rate: number | null;
  payout_type: string | null;
  hybrid_reward_description: string | null;
  artist: {
    username: string;
    display_name: string | null;
  };
  total_views: number;
}

const Hero = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleStartCampaign = () => {
    navigate('/login');
  };

  const handleBrowseCampaigns = () => {
    navigate('/campaigns');
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const formatPayout = (campaign: Campaign) => {
    if (campaign.payout_type === 'performance_based' && campaign.payout_rate) {
      return `$${campaign.payout_rate}/1k views`;
    } else if (campaign.payout_type === 'fixed_rate' && campaign.payout_rate) {
      return `$${campaign.payout_rate} Fixed`;
    } else if (campaign.payout_type === 'hybrid' && campaign.hybrid_reward_description) {
      return campaign.hybrid_reward_description;
    }
    return 'View Details';
  };

  useEffect(() => {
    const fetchTrendingCampaigns = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select(`
            id,
            song_title,
            title,
            genre,
            cover_art_url,
            payout_rate,
            payout_type,
            hybrid_reward_description,
            artist:profiles!campaigns_artist_id_fkey(username, display_name),
            participations:campaign_participations(current_views)
          `)
          .eq('status', 'active')
          .eq('campaign_mode', 'reward_others')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const campaignsWithViews = data?.map(campaign => ({
          ...campaign,
          artist: Array.isArray(campaign.artist) ? campaign.artist[0] : campaign.artist,
          total_views: campaign.participations?.reduce((sum: number, p: any) => sum + (p.current_views || 0), 0) || 0
        })) || [];

        campaignsWithViews.sort((a, b) => b.total_views - a.total_views);

        setCampaigns(campaignsWithViews);
      } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        toast({
          title: "Error",
          description: "Failed to load trending campaigns",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingCampaigns();
  }, [toast]);

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
          
          {/* Trending Campaigns Carousel */}
          <div className="mt-20">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">Trending Campaigns</h3>
            <div className="relative">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-xl p-6 border border-border">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : campaigns.length > 0 ? (
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
                    {campaigns.map((campaign) => (
                      <CarouselItem key={campaign.id} className="md:basis-1/2 lg:basis-1/3">
                        <div 
                          onClick={() => navigate(`/campaign/${campaign.id}/join`)}
                          className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:border-primary/30 cursor-pointer group relative"
                        >
                          {campaign.total_views > 10000 && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              TRENDING
                            </div>
                          )}
                          <div className="flex items-start space-x-4">
                            <img 
                              src={campaign.cover_art_url || vuelixLogo} 
                              alt={campaign.song_title}
                              className="w-16 h-16 rounded-lg object-cover bg-muted"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg leading-tight mb-1 truncate">{campaign.song_title}</h4>
                              <p className="text-muted-foreground text-sm mb-2 font-medium">
                                by {campaign.artist?.display_name || campaign.artist?.username || 'Unknown Artist'}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">{campaign.genre}</span>
                                <span className="text-muted-foreground font-semibold">{formatViews(campaign.total_views)} views</span>
                              </div>
                              <div className="mt-3 text-lg font-bold text-primary">{formatPayout(campaign)}</div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
                </Carousel>
              ) : (
                <p className="text-center text-muted-foreground">No trending campaigns at the moment</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;