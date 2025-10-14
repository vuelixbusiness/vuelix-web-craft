import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CampaignCard from "@/components/ui/campaign-card";
import Navigation from "@/components/Navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Music, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CampaignFilters, ActiveFilters, FilterState } from "@/components/campaigns/CampaignFilters";

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
  payout_rate: number | null;
  hybrid_reward_description?: string;
  fixed_rate_description?: string;
  vip_bonus: number;
  max_payout: number;
  vip_max_payout: number;
  instructions: string;
  budget: number;
  end_date: string;
  artist_id: string;
  isJoined?: boolean;
  profiles?: {
    display_name?: string;
    username?: string;
    user_type?: string;
    country?: string;
  } | null;
}

const Campaigns = () => {
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [totalCreators, setTotalCreators] = useState(0);
  const [unclaimedRewards, setUnclaimedRewards] = useState<number>(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter state
  const maxPayout = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.payout_rate || 0)) : 1;
  const [filters, setFilters] = useState<FilterState>({
    campaignTypes: [],
    userTypes: [],
    rewardRange: [0, maxPayout],
    location: null,
    genres: [],
  });

  // Update reward range when campaigns load
  useEffect(() => {
    if (campaigns.length > 0 && filters.rewardRange[1] === 0) {
      const max = Math.max(...campaigns.map(c => c.payout_rate || 0));
      setFilters(prev => ({ ...prev, rewardRange: [0, max] }));
    }
  }, [campaigns]);

  // Extract unique genres and locations
  const availableGenres = [...new Set(campaigns.map(c => c.genre))].sort();
  const availableLocations = [...new Set(campaigns.map(c => c.profiles?.country).filter(Boolean) as string[])].sort();

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
          hybrid_reward_description,
          fixed_rate_description,
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
        .select('user_id, display_name, username, user_type, country')
        .in('user_id', artistIds);

      console.log('👤 Profiles query result:', { profilesData, profilesError });

      // Check user participation if logged in
      let participationData: any[] = [];
      if (user) {
        const { data: userParticipations } = await supabase
          .from('campaign_participations')
          .select('campaign_id')
          .eq('creator_id', user.id)
          .in('campaign_id', campaignsData.map(c => c.id))
          .in('status', ['approved', 'joined', 'live', 'submitted']);
        
        participationData = userParticipations || [];
      }

      // Merge the data
      const campaignsWithProfiles = campaignsData.map(campaign => ({
        ...campaign,
        description: campaign.instructions,
        isJoined: participationData.some(p => p.campaign_id === campaign.id),
        profiles: profilesData?.find(p => p.user_id === campaign.artist_id) || null
      }));

      console.log('✅ Final campaigns with profiles:', campaignsWithProfiles);
      setCampaigns(campaignsWithProfiles as Campaign[]);
      
      // Calculate unclaimed rewards after campaigns are loaded
      await calculateUnclaimedRewards(campaignsWithProfiles as Campaign[]);
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

  const fetchTotalCreators = async () => {
    try {
      console.log('👥 Fetching total creators count...');
      
      // Get total number of creators registered on the platform
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'creator');

      if (error) throw error;

      const totalCount = count || 0;

      console.log('👥 Total creators on platform:', totalCount);
      setTotalCreators(totalCount);
    } catch (error) {
      console.error('💥 Error fetching total creators:', error);
      setTotalCreators(0);
    }
  };

  const calculateUnclaimedRewards = async (activeCampaigns: Campaign[]) => {
    try {
      console.log('💰 Calculating unclaimed rewards...');
      
      // Calculate total budgets from active campaigns
      const totalBudgets = activeCampaigns.reduce((sum, campaign) => {
        return sum + (campaign.budget || 0);
      }, 0);
      
      console.log('📊 Total campaign budgets:', totalBudgets);
      
      // Get total claimed payouts across all campaigns
      const { data: claimedData, error } = await supabase
        .from('campaign_participations')
        .select('payout_amount')
        .eq('payout_claimed', true);
      
      if (error) throw error;
      
      const totalClaimed = claimedData?.reduce((sum, participation) => {
        return sum + (Number(participation.payout_amount) || 0);
      }, 0) || 0;
      
      console.log('💸 Total claimed payouts:', totalClaimed);
      
      // Calculate unclaimed rewards
      const unclaimed = totalBudgets - totalClaimed;
      
      console.log('✨ Unclaimed rewards:', unclaimed);
      
      setUnclaimedRewards(unclaimed);
    } catch (error) {
      console.error('💥 Error calculating unclaimed rewards:', error);
      setUnclaimedRewards(0);
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
    fetchTotalCreators();
  }, []);

  // Set up real-time subscription for creator count updates
  useEffect(() => {
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'user_type=eq.creator'
        },
        () => {
          console.log('🔄 New creator registered, updating count...');
          fetchTotalCreators();
        }
      )
      .subscribe();

    // Refresh data when page becomes visible (user returns from another tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👀 Page became visible, refreshing creator count...');
        fetchTotalCreators();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  // Advanced filtering
  const filteredCampaigns = campaigns.filter(campaign => {
    // Search query
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchTerm) ||
        campaign.song_title.toLowerCase().includes(searchTerm) ||
        (campaign.profiles?.display_name || '').toLowerCase().includes(searchTerm) ||
        campaign.genre.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Campaign types
    if (filters.campaignTypes.length > 0) {
      if (!filters.campaignTypes.includes(campaign.campaign_type)) {
        return false;
      }
    }

    // User types (artist's user type)
    if (filters.userTypes.length > 0) {
      const artistType = campaign.profiles?.user_type;
      if (!artistType || !filters.userTypes.includes(artistType)) {
        return false;
      }
    }

    // Reward range
    const payout = campaign.payout_rate || 0;
    if (payout < filters.rewardRange[0] || payout > filters.rewardRange[1]) {
      return false;
    }

    // Location
    if (filters.location) {
      const artistCountry = campaign.profiles?.country;
      if (artistCountry !== filters.location) {
        return false;
      }
    }

    // Genres
    if (filters.genres.length > 0) {
      if (!filters.genres.includes(campaign.genre)) {
        return false;
      }
    }

    return true;
  });

  const handleRemoveFilter = (filterType: keyof FilterState, value?: string) => {
    if (filterType === 'location') {
      setFilters(prev => ({ ...prev, location: null }));
    } else if (filterType === 'rewardRange') {
      setFilters(prev => ({ ...prev, rewardRange: [0, maxPayout] }));
    } else if (value) {
      setFilters(prev => ({
        ...prev,
        [filterType]: (prev[filterType] as string[]).filter(v => v !== value),
      }));
    }
  };

  const handleCampaignClick = (campaign: Campaign) => {
    if (user) {
      navigate(`/campaign/${campaign.id}/join`);
    } else {
      navigate('/login');
    }
  };

  const campaignsContent = (
    <div className="relative container mx-auto px-6 py-8">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-300/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">Discover Campaigns</h1>
              <p className="text-muted-foreground">
                Find amazing music campaigns and start earning rewards
              </p>
            </div>
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search campaigns, artists, songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Campaigns
              </CardTitle>
              <Music className="w-5 h-5 text-stat-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{isLoading ? '...' : campaigns.length}</div>
              <p className="text-xs text-muted-foreground">Available to join</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unclaimed Rewards
              </CardTitle>
              <DollarSign className="w-5 h-5 text-stat-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${isLoading ? '...' : unclaimedRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total available rewards</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Creators
              </CardTitle>
              <Users className="w-5 h-5 text-stat-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{isLoading ? '...' : totalCreators}</div>
              <p className="text-xs text-muted-foreground">On the platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <CampaignFilters
              filters={filters}
              onFiltersChange={setFilters}
              maxPayout={maxPayout}
              availableGenres={availableGenres}
              availableLocations={availableLocations}
            />
          </div>

          {/* Campaigns List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              availableGenres={availableGenres}
              availableLocations={availableLocations}
            />

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : filteredCampaigns.length === 0 ? (
            <Card className="bg-card border-border col-span-full">
              <CardContent className="text-center py-12">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-foreground">No campaigns found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Check back later for new campaigns.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCampaigns.map((campaign) => (
              <div key={campaign.id} onClick={() => handleCampaignClick(campaign)} className="cursor-pointer">
                <CampaignCard
                  campaign={campaign}
                  variant="creator-available"
                  showJoinButton={true}
                  showPlayButton={true}
                  isJoined={campaign.isJoined}
                  onJoinCampaign={() => handleCampaignClick(campaign)}
                  onAudioToggle={toggleAudio}
                  isPlaying={currentlyPlaying === campaign.id}
                />
              </div>
            ))
          )}
            </div>
          </div>
        </div>
      </div>

        {/* Audio element for campaign previews */}
        <audio
          ref={audioRef}
          onEnded={() => setCurrentlyPlaying(null)}
          onError={() => setCurrentlyPlaying(null)}
        />
      </div>
    </div>
  );

  // Show appropriate layout based on authentication status
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <DashboardLayout>
        {campaignsContent}
      </DashboardLayout>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-800 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-300/10 via-transparent to-transparent pointer-events-none" />
      
      <Navigation />
      <div className="pt-20 relative z-10">
        {campaignsContent}
      </div>
    </div>
  );
};

export default Campaigns;