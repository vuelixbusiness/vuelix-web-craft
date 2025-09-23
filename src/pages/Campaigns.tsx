import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CampaignCard from "@/components/ui/campaign-card";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Music, DollarSign, Users, Filter } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url: string;
  cover_art_url: string;
  campaign_type: string;
  genre: string;
  platforms: string[];
  payout_type: string;
  payout_rate: number;
  vip_bonus: number;
  max_payout: number;
  vip_max_payout: number;
  instructions: string;
  budget: number;
  end_date: string;
  artist_id: string;
  profiles?: {
    display_name?: string;
  } | null;
}

const Campaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchCampaigns = async () => {
    try {
      console.log('🔍 Fetching campaigns...');
      
      // First get campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          song_title,
          song_url,
          cover_art_url,
          campaign_type,
          genre,
          platforms,
          payout_type,
          payout_rate,
          vip_bonus,
          max_payout,
          vip_max_payout,
          instructions,
          budget,
          end_date,
          artist_id
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('📊 Campaigns query result:', { campaignsData, campaignsError });

      if (campaignsError) throw campaignsError;

      if (!campaignsData || campaignsData.length === 0) {
        console.log('❌ No campaigns found');
        setCampaigns([]);
        return;
      }

      // Then get artist profiles for the campaigns
      const artistIds = [...new Set(campaignsData.map(c => c.artist_id))];
      console.log('👥 Fetching profiles for artist IDs:', artistIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', artistIds);

      console.log('👤 Profiles query result:', { profilesData, profilesError });

      // Merge the data
      const campaignsWithProfiles = campaignsData.map(campaign => ({
        ...campaign,
        profiles: profilesData?.find(p => p.user_id === campaign.artist_id) || null
      }));

      console.log('✅ Final campaigns with profiles:', campaignsWithProfiles);
      setCampaigns(campaignsWithProfiles as Campaign[]);
    } catch (error) {
      console.error('💥 Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Audio control functions
  const toggleAudio = (campaignId: string, songUrl: string) => {
    if (!audioRef.current) return;

    if (currentlyPlaying === campaignId) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying) {
        audioRef.current.pause();
      }
      audioRef.current.src = songUrl;
      audioRef.current.play();
      setCurrentlyPlaying(campaignId);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.song_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (campaign.profiles?.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Discover Campaigns</h1>
            <p className="text-muted-foreground">
              Find amazing music campaigns and start earning rewards
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns, artists, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Campaigns
                </CardTitle>
                <Music className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : campaigns.length}</div>
                <p className="text-xs text-muted-foreground">Available to join</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Payout
                </CardTitle>
                <DollarSign className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${isLoading ? '...' : campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + c.payout_rate, 0) / campaigns.length).toFixed(3) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Per qualified view</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Creators
                </CardTitle>
                <Users className="w-5 h-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Participating</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="shadow-soft animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-secondary rounded" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="shadow-soft col-span-full">
                <CardContent className="text-center py-12">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Check back later for new campaigns.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  variant="creator-available"
                  showJoinButton={true}
                  showPlayButton={true}
                  onJoinCampaign={(campaign) => setSelectedCampaign(campaign as any)}
                  onAudioToggle={toggleAudio}
                  isPlaying={currentlyPlaying === campaign.id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audio element for campaign previews */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlaying(null)}
        onError={() => setCurrentlyPlaying(null)}
      />
    </DashboardLayout>
  );
};

export default Campaigns;