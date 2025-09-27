import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCard from "@/components/ui/campaign-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  PlayCircle, 
  DollarSign, 
  Eye,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

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
  rules?: string;
  budget: number;
  end_date: string;
  artist_id: string;
  profiles?: {
    display_name?: string;
  } | null;
}

interface Participation {
  id: string;
  status: string;
  video_url: string;
  platform: string;
  current_views: number;
  current_likes: number;
  payout_amount: number;
  created_at: string;
  updated_at: string;
  campaign_id: string;
  campaigns: Campaign;
}

const CampaignManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('available');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const platformIcons = {
    tiktok: <FaTiktok className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    youtube: <FaYoutube className="w-4 h-4" />
  };

  const platformNames = {
    tiktok: "TikTok",
    instagram: "Instagram", 
    youtube: "YouTube"
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    rejected: <AlertCircle className="w-4 h-4 text-red-500" />
  };

  const fetchCampaigns = async () => {
    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id, title, song_title, song_url, cover_art_url, campaign_type,
          genre, platforms, payout_type, payout_rate, vip_bonus,
          max_payout, vip_max_payout, instructions, rules, budget, end_date, artist_id
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      if (campaignsData && campaignsData.length > 0) {
        // Fetch redeemed amounts for each campaign
        const campaignIds = campaignsData.map(c => c.id);
        const { data: participationsData, error: participationsError } = await supabase
          .from('campaign_participations')
          .select('campaign_id, payout_amount')
          .in('campaign_id', campaignIds);

        if (participationsError) {
          console.error('Error fetching participations for budget calculation:', participationsError);
        }

        // Calculate redeemed amounts per campaign
        const redeemedAmounts = participationsData?.reduce((acc, participation) => {
          acc[participation.campaign_id] = (acc[participation.campaign_id] || 0) + (participation.payout_amount || 0);
          return acc;
        }, {} as Record<string, number>) || {};

        // Fetch artist profiles for campaigns
        const artistIds = [...new Set(campaignsData.map(c => c.artist_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', artistIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Map profiles and budget information to campaigns
        const campaignsWithProfiles = campaignsData.map(campaign => {
          const redeemed = redeemedAmounts[campaign.id] || 0;
          const availableBudget = Math.max(0, (campaign.budget || 0) - redeemed);
          const budgetUsedPercentage = campaign.budget ? (redeemed / campaign.budget) * 100 : 0;

          return {
            ...campaign,
            description: campaign.instructions,
            profiles: profilesData?.find(p => p.user_id === campaign.artist_id) || null,
            redeemed,
            availableBudget,
            budgetUsedPercentage
          };
        });

        setCampaigns(campaignsWithProfiles as Campaign[]);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    }
  };

  const fetchParticipations = async () => {
    if (!user?.id) return;
    
    try {
      // First fetch participations with campaigns data including budget
      const { data: participationData, error: participationError } = await supabase
        .from('campaign_participations')
        .select(`
          *, 
          campaigns (
            id, title, song_title, song_url, cover_art_url, genre, platforms, 
            payout_type, payout_rate, artist_id, budget
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (participationError) throw participationError;

      // Calculate budget information for joined campaigns
      const campaignIds = [...new Set(participationData?.map(p => p.campaigns?.id).filter(Boolean) || [])];
      
      // Fetch all participations for these campaigns to calculate redeemed amounts
      const { data: allParticipationsData, error: allParticipationsError } = await supabase
        .from('campaign_participations')
        .select('campaign_id, payout_amount')
        .in('campaign_id', campaignIds);

      if (allParticipationsError) {
        console.error('Error fetching all participations for budget calculation:', allParticipationsError);
      }

      // Calculate redeemed amounts per campaign
      const redeemedAmounts = allParticipationsData?.reduce((acc, participation) => {
        acc[participation.campaign_id] = (acc[participation.campaign_id] || 0) + (participation.payout_amount || 0);
        return acc;
      }, {} as Record<string, number>) || {};

      // Extract unique artist IDs to fetch profiles
      const artistIds = [...new Set(participationData?.map(p => p.campaigns?.artist_id).filter(Boolean) || [])];
      
      // Fetch profiles for artists
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', artistIds);

      if (profilesError) throw profilesError;

      // Map profiles to campaigns and add budget information
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      const enrichedParticipations = participationData?.map(participation => {
        const redeemed = redeemedAmounts[participation.campaigns?.id] || 0;
        const budget = participation.campaigns?.budget || 0;
        const availableBudget = Math.max(0, budget - redeemed);
        const budgetUsedPercentage = budget ? (redeemed / budget) * 100 : 0;

        return {
          ...participation,
          campaigns: {
            ...participation.campaigns,
            profiles: profilesMap.get(participation.campaigns?.artist_id),
            redeemed,
            availableBudget,
            budgetUsedPercentage
          }
        };
      }) || [];

      setParticipations(enrichedParticipations as any[]);
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  // Group participations by campaign to show each campaign only once
  const getUniqueCampaigns = () => {
    const campaignMap = new Map();
    
    participations.forEach(participation => {
      if (!campaignMap.has(participation.campaign_id)) {
        campaignMap.set(participation.campaign_id, participation);
      }
    });
    
    return Array.from(campaignMap.values());
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.song_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.profiles?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !selectedPlatform || campaign.platforms.includes(selectedPlatform);
    return matchesSearch && matchesPlatform;
  });

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
    setIsLoading(true);
    Promise.all([fetchCampaigns(), fetchParticipations()]).finally(() => {
      setIsLoading(false);
    });
  }, [user?.id]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Management</h2>
          <p className="text-muted-foreground">Browse, join, and track your campaigns</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="active">Joined campaigns ({getUniqueCampaigns().length})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({participations.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Platform Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedPlatform === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedPlatform('')}
            >
              All Platforms
            </Badge>
            {['tiktok', 'instagram', 'youtube'].map((platform) => (
              <Badge
                key={platform}
                variant={selectedPlatform === platform ? 'default' : 'outline'}
                className="cursor-pointer flex items-center space-x-1"
                onClick={() => setSelectedPlatform(platform)}
              >
                {platformIcons[platform as keyof typeof platformIcons]}
                <span>{platformNames[platform as keyof typeof platformNames]}</span>
              </Badge>
            ))}
          </div>

          {/* Available Campaigns Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-secondary rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCampaigns.map((campaign) => (
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
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getUniqueCampaigns().map((participation) => (
              <CampaignCard
                key={participation.campaign_id}
                campaign={{
                  id: participation.campaign_id,
                  title: participation.campaigns.title,
                  song_title: participation.campaigns.song_title,
                  song_url: (participation.campaigns as any).song_url,
                  cover_art_url: (participation.campaigns as any).cover_art_url,
                  genre: participation.campaigns.genre,
                  platforms: (participation.campaigns as any).platforms || [participation.platform],
                  payout_type: (participation.campaigns as any).payout_type,
                  payout_rate: (participation.campaigns as any).payout_rate,
                  profiles: participation.campaigns.profiles,
                  artist_id: participation.campaigns.artist_id,
                  budget: (participation.campaigns as any).budget,
                  redeemed: (participation.campaigns as any).redeemed,
                  availableBudget: (participation.campaigns as any).availableBudget,
                  budgetUsedPercentage: (participation.campaigns as any).budgetUsedPercentage
                } as any}
                variant="creator-joined"
                showPlayButton={true}
                onAudioToggle={toggleAudio}
                isPlaying={currentlyPlaying === participation.campaign_id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {participations.map((participation) => (
              <CampaignCard
                key={participation.id}
                campaign={{
                  id: participation.campaign_id,
                  song_title: participation.campaigns.song_title,
                  song_url: (participation.campaigns as any).song_url,
                  cover_art_url: (participation.campaigns as any).cover_art_url,
                  genre: participation.campaigns.genre,
                  platforms: [participation.platform],
                  status: participation.status,
                  profiles: participation.campaigns.profiles,
                  end_date: participation.created_at,
                  // Add submission-specific data
                  current_views: participation.current_views,
                  current_likes: participation.current_likes,
                  payout_amount: participation.payout_amount,
                  video_url: participation.video_url,
                  platform: participation.platform,
                  updated_at: participation.updated_at
                } as any}
                variant="creator-submission"
                showPlayButton={true}
                onAudioToggle={toggleAudio}
                isPlaying={currentlyPlaying === participation.campaign_id}
              />
            ))}
          </div>
        </TabsContent>


        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Completed Campaigns</h3>
              <p className="text-muted-foreground">
                Your completed campaigns will appear here once campaigns end.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Audio element for campaign previews */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlaying(null)}
        onError={() => setCurrentlyPlaying(null)}
      />
    </div>
  );
};

export default CampaignManagement;