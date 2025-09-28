import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useArtistNotifications } from "@/contexts/ArtistNotificationContext";
import { Plus, Music, Users, TrendingUp, Play, Pause, Eye, Heart, BarChart3, MessageCircle, Settings, Star, DollarSign } from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";
import ArtistCampaignList from "@/components/ArtistCampaignList";
import vuelixLogo from "@/assets/vuelix-logo-v.png";

type DashboardProfile = 'campaigns' | 'analytics' | 'creators' | 'settings';

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  status: string;
  budget: number;
  genre: string;
  created_at: string;
  payout_type: string;
  platforms: string[];
  cover_art_url?: string;
  artist_id: string;
  instructions?: string;
  rules?: string;
  // Additional fields from spending calculation
  actualSpent?: number;
  estimatedPending?: number;
  totalViews?: number;
  totalLikes?: number;
  creatorCount?: number;
  availableBudget?: number;
}

// Platform icon mapping
const platformIcons: { [key: string]: JSX.Element } = {
  'tiktok': <FaTiktok className="w-5 h-5 text-current" />,
  'instagram': <FaInstagram className="w-5 h-5 text-current" />,
  'youtube': <FaYoutube className="w-5 h-5 text-current" />,
  'twitter': <FaTwitter className="w-5 h-5 text-current" />,
};

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalViews: number;
  totalSpent: number;
  totalCreators: number;
  averageEngagement: number;
  monthlyGrowth: number;
}

const ArtistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markArtistDashboardVisited } = useArtistNotifications();
  const [activeProfile, setActiveProfile] = useState<DashboardProfile>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalViews: 0,
    totalSpent: 0,
    totalCreators: 0,
    averageEngagement: 0,
    monthlyGrowth: 0
  });

  // Fetch campaigns from database
  const fetchCampaigns = async () => {
    if (!user?.id) return;

    try {
      console.log('🔍 Fetching campaigns for artist:', user.id);
      
      // Fetch campaigns with spending data
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignError) {
        console.error('❌ Error fetching campaigns:', campaignError);
        toast({
          title: "Error Loading Campaigns",
          description: "Failed to load your campaigns. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Fetch spending data for all campaigns
      const { data: spendingData, error: spendingError } = await supabase
        .from('campaign_participations')
        .select(`
          campaign_id,
          payout_amount,
          payout_claimed,
          current_views,
          current_likes,
          creator_id
        `)
        .in('campaign_id', campaignData?.map(c => c.id) || []);

      if (spendingError) {
        console.error('❌ Error fetching spending data:', spendingError);
      }

      console.log('✅ Campaigns and spending data fetched successfully');

      // Process campaigns with actual spending data
      const campaignsWithSpending = campaignData?.map(campaign => {
        const participations = spendingData?.filter(p => p.campaign_id === campaign.id) || [];
        const totalSpent = participations
          .filter(p => p.payout_claimed)
          .reduce((sum, p) => sum + (Number(p.payout_amount) || 0), 0);
        const estimatedPending = participations
          .filter(p => !p.payout_claimed && p.payout_amount > 0)
          .reduce((sum, p) => sum + (Number(p.payout_amount) || 0), 0);
        const totalViews = participations.reduce((sum, p) => sum + (Number(p.current_views) || 0), 0);
        const totalLikes = participations.reduce((sum, p) => sum + (Number(p.current_likes) || 0), 0);
        const creatorCount = new Set(participations.map(p => p.creator_id)).size;

        return {
          ...campaign,
          actualSpent: totalSpent,
          estimatedPending: estimatedPending,
          totalViews: totalViews,
          totalLikes: totalLikes,
          creatorCount: creatorCount,
          availableBudget: Number(campaign.budget) - totalSpent - estimatedPending
        };
      }) || [];

      setCampaigns(campaignsWithSpending);
      
      // Calculate stats from real data
      if (campaignsWithSpending) {
        const activeCampaigns = campaignsWithSpending.filter(c => c.status === 'active').length;
        const totalBudget = campaignsWithSpending.reduce((sum, c) => sum + Number(c.budget || 0), 0);
        const totalActualSpent = campaignsWithSpending.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
        const totalViews = campaignsWithSpending.reduce((sum, c) => sum + (c.totalViews || 0), 0);
        const totalCreators = new Set(spendingData?.filter(p => p.creator_id !== user?.id).map(p => p.creator_id) || []).size;
        
        setStats({
          totalCampaigns: campaignsWithSpending.length,
          activeCampaigns,
          totalViews: totalViews,
          totalSpent: totalActualSpent,
          totalCreators: totalCreators,
          averageEngagement: totalViews > 0 ? ((totalViews * 0.05) / totalViews) * 100 : 0,
          monthlyGrowth: 12.5 // Would need historical data
        });
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading campaigns.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time subscription and mark dashboard as visited
  useEffect(() => {
    fetchCampaigns();
    markArtistDashboardVisited();

    if (!user?.id) return;

    // Subscribe to campaign changes
    const channel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `artist_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time campaign update:', payload);
          fetchCampaigns(); // Refetch campaigns when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Audio control functions
  const toggleAudio = (campaignId: string, songUrl: string) => {
    if (!audioRef.current) return;

    if (currentlyPlaying === campaignId) {
      // Pause current audio
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      // Play new audio
      if (currentlyPlaying) {
        audioRef.current.pause();
      }
      audioRef.current.src = songUrl;
      audioRef.current.play();
      setCurrentlyPlaying(campaignId);
    }
  };

  // Delete campaign function
  const deleteCampaign = async (campaignId: string) => {
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('artist_id', user.id);

      if (error) {
        console.error('❌ Error deleting campaign:', error);
        toast({
          title: "Error Deleting Campaign",
          description: "Failed to delete the campaign. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Campaign Deleted",
        description: "The campaign has been permanently deleted.",
      });

      // Remove the campaign from the local state
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } catch (error) {
      console.error('❌ Unexpected error deleting campaign:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the campaign.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Helper function to format campaign data for display
  const formatCampaignForDisplay = (campaign: Campaign) => ({
    id: campaign.id,
    songTitle: campaign.song_title,
    songUrl: campaign.song_url,
    status: campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1),
    budget: Number(campaign.budget),
    spent: Number(campaign.actualSpent) || 0,
    estimatedPending: Number(campaign.estimatedPending) || 0,
    available: Number(campaign.availableBudget) || Number(campaign.budget),
    creators: campaign.creatorCount || 0,
    videos: campaign.creatorCount || 0, // Each creator typically creates one video
    views: campaign.totalViews || 0,
    likes: campaign.totalLikes || 0,
    genre: campaign.genre,
    platforms: campaign.platforms
  });

  const creatorStats = [
    { id: 1, name: "Sarah Kim", username: "@sarahk", campaigns: 3, totalViews: 45600, engagement: 4.8, earnings: 240 },
    { id: 2, name: "Mike Chen", username: "@mikec", campaigns: 2, totalViews: 32100, engagement: 4.3, earnings: 180 },
    { id: 3, name: "Alex Rivera", username: "@alexr", campaigns: 4, totalViews: 58900, engagement: 4.6, earnings: 320 },
  ];

  const profileConfigs = {
    campaigns: {
      title: "Campaign Manager",
      description: "Manage and monitor your music campaigns",
      icon: Music,
      color: "text-blue-500"
    },
    analytics: {
      title: "Analytics Hub",
      description: "Track performance and insights",
      icon: BarChart3,
      color: "text-green-500"
    },
    creators: {
      title: "Creator Relations",
      description: "Manage creator partnerships",
      icon: Users,
      color: "text-purple-500"
    },
    settings: {
      title: "Account Settings",
      description: "Configure your artist profile",
      icon: Settings,
      color: "text-gray-500"
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Switcher Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Artist Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your campaigns, track engagement, and measure your reach.
          </p>
            </div>
            <Button onClick={() => navigate('/artist-campaign')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </Button>
          </div>

           {/* Profile Tabs */}
          <Tabs value={activeProfile} onValueChange={(value) => setActiveProfile(value as DashboardProfile)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(profileConfigs).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                    <IconComponent className={`w-4 h-4 ${config.color}`} />
                    <span className="hidden sm:inline">{config.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Active Profile Info */}
            <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center space-x-3">
                {(() => {
                  const IconComponent = profileConfigs[activeProfile].icon;
                  return <IconComponent className={`w-6 h-6 ${profileConfigs[activeProfile].color}`} />;
                })()}
                <div>
                  <h2 className="text-xl font-semibold">{profileConfigs[activeProfile].title}</h2>
                  <p className="text-muted-foreground">{profileConfigs[activeProfile].description}</p>
                </div>
              </div>
            </div>

            {/* Campaign Manager Profile */}
            <TabsContent value="campaigns" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Campaigns</p>
                        <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                      </div>
                      <Music className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Campaigns</p>
                        <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                      </div>
                      <Eye className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaigns */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Your Campaigns</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant={viewMode === 'cards' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setViewMode('cards')}
                    >
                      Cards
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </Button>
                  </div>
                </div>
                
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {isLoading ? (
                      // Loading skeletons
                      Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="h-80">
                          <CardContent className="p-6">
                            <div className="flex space-x-4 mb-4">
                              <Skeleton className="w-20 h-20 rounded-lg" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                              </div>
                            </div>
                            <Skeleton className="h-32 w-full" />
                          </CardContent>
                        </Card>
                      ))
                    ) : campaigns.length === 0 ? (
                      // Empty state
                      <div className="col-span-full text-center py-20">
                        <Music className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                        <h3 className="text-2xl font-semibold mb-3">No Campaigns Yet</h3>
                        <p className="text-muted-foreground mb-6 text-lg">
                          Create your first campaign to start promoting your music
                        </p>
                        <Button size="lg" onClick={() => navigate('/artist-campaign')}>
                          <Plus className="w-5 h-5 mr-2" />
                          Create Campaign
                        </Button>
                      </div>
                    ) : (
                      campaigns.map((campaign) => {
                        const displayCampaign = formatCampaignForDisplay(campaign);
                        const totalCommitted = displayCampaign.spent + displayCampaign.estimatedPending;
                        const availableBudget = displayCampaign.available;
                        const progressPercentage = displayCampaign.budget > 0 ? (totalCommitted / displayCampaign.budget) * 100 : 0;
                      
                      return (
                        <Card key={campaign.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] min-h-[400px]">
                          {/* Header Section with Cover Art */}
                          <div className="relative h-32 bg-gradient-to-r from-primary/10 to-primary/20 flex items-center p-6">
                            {/* Campaign Cover Art */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg bg-card mr-6 flex-shrink-0 relative">
                              <img 
                                src={campaign.cover_art_url || vuelixLogo} 
                                alt={displayCampaign.songTitle}
                                className="w-full h-full object-cover"
                              />
                              {/* Icon Box Overlay */}
                              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                                <Music className="w-3 h-3 text-primary" />
                              </div>
                            </div>
                            
                            {/* Campaign Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-2xl font-bold text-foreground truncate">
                                      {displayCampaign.songTitle}
                                    </h3>
                                    {displayCampaign.songUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleAudio(campaign.id, displayCampaign.songUrl!)}
                                        className="w-8 h-8 p-0 flex-shrink-0"
                                      >
                                        {currentlyPlaying === campaign.id ? (
                                          <Pause className="w-4 h-4" />
                                        ) : (
                                          <Play className="w-4 h-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground text-sm mb-2">
                                    by {user?.name || 'Unknown Artist'}
                                  </p>
                                  
                                  {/* Platforms */}
                                  <div className="flex items-center space-x-2">
                                    {campaign.platforms?.map((platform, index) => (
                                      <div key={index} className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center shadow-sm">
                                        {platformIcons[platform] || <Music className="w-4 h-4" />}
                                      </div>
                                    ))}
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {displayCampaign.genre}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Status Badge */}
                                <Badge 
                                  variant={displayCampaign.status === 'Active' ? 'default' : 
                                           displayCampaign.status === 'Paused' ? 'secondary' :
                                           displayCampaign.status === 'Completed' ? 'secondary' : 'outline'}
                                  className="text-sm px-3 py-1"
                                >
                                  {displayCampaign.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <CardContent className="p-6 space-y-6">
                            {/* Financial Section - Engagement Pot */}
                            <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg flex items-center">
                                  <DollarSign className="w-5 h-5 mr-2 text-primary" />
                                  Engagement Pot
                                </h4>
                                <span className="text-sm text-muted-foreground">
                                  {progressPercentage.toFixed(1)}% used
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(availableBudget)}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Available
                                  </span>
                                </div>
                                 
                                 {displayCampaign.estimatedPending > 0 && (
                                   <div className="flex justify-between items-baseline text-sm">
                                     <span className="text-orange-600">
                                       {formatCurrency(displayCampaign.estimatedPending)}
                                     </span>
                                     <span className="text-muted-foreground">
                                       Pending Payout
                                     </span>
                                   </div>
                                 )}
                                 
                                 <div className="flex justify-between items-baseline text-sm">
                                   <span className="text-muted-foreground">
                                     {formatCurrency(displayCampaign.spent)} redeemed
                                   </span>
                                   <span className="text-muted-foreground">
                                     of {formatCurrency(displayCampaign.budget)} total
                                   </span>
                                 </div>
                               </div>
                                 
                                 {/* Enhanced Progress Bar */}
                                 <div className="relative">
                                   <Progress 
                                     value={progressPercentage} 
                                     className="h-3 bg-secondary"
                                   />
                                   <div className="absolute inset-0 flex items-center justify-center">
                                     <span className="text-xs font-medium text-primary-foreground">
                                       {progressPercentage > 15 ? `${progressPercentage.toFixed(0)}%` : ''}
                                     </span>
                                   </div>
                                 </div>
                               </div>
                             
                             {/* Performance Stats */}
                             <div className="grid grid-cols-4 gap-4">
                               <div className="text-center p-3 bg-secondary/20 rounded-lg">
                                 <div className="flex items-center justify-center mb-1">
                                   <Users className="w-4 h-4 text-muted-foreground" />
                                 </div>
                                 <p className="text-xl font-bold">{displayCampaign.creators}</p>
                                 <p className="text-xs text-muted-foreground">Creators</p>
                               </div>
                               <div className="text-center p-3 bg-secondary/20 rounded-lg">
                                 <div className="flex items-center justify-center mb-1">
                                   <Play className="w-4 h-4 text-muted-foreground" />
                                 </div>
                                 <p className="text-xl font-bold">{displayCampaign.videos}</p>
                                 <p className="text-xs text-muted-foreground">Videos</p>
                               </div>
                               <div className="text-center p-3 bg-secondary/20 rounded-lg">
                                 <div className="flex items-center justify-center mb-1">
                                   <Eye className="w-4 h-4 text-muted-foreground" />
                                 </div>
                                 <p className="text-xl font-bold">{displayCampaign.views.toLocaleString()}</p>
                                 <p className="text-xs text-muted-foreground">Views</p>
                               </div>
                               <div className="text-center p-3 bg-secondary/20 rounded-lg">
                                 <div className="flex items-center justify-center mb-1">
                                   <Heart className="w-4 h-4 text-muted-foreground" />
                                 </div>
                                 <p className="text-xl font-bold">{displayCampaign.likes.toLocaleString()}</p>
                                 <p className="text-xs text-muted-foreground">Likes</p>
                               </div>
                             </div>
                             
                             {/* Action Buttons */}
                             <div className="flex space-x-3 pt-2">
                                <Button 
                                  variant="outline" 
                                  size="default" 
                                  className="flex-1"
                                  onClick={() => navigate(`/artist/campaign/${campaign.id}`)}
                                >
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  View Campaign
                                </Button>
                               {(displayCampaign.status === 'Active' || displayCampaign.status === 'Paused') && (
                                 <Button 
                                   size="default" 
                                   className="flex-1"
                                   onClick={() => navigate(`/campaign/${campaign.id}/manage`)}
                                 >
                                   <Settings className="w-4 h-4 mr-2" />
                                   Manage
                                 </Button>
                               )}
                               {displayCampaign.status === 'Draft' && (
                                 <Button size="default" className="flex-1">
                                   <Play className="w-4 h-4 mr-2" />
                                   Launch
                                 </Button>
                               )}
                             </div>
                           </CardContent>
                         </Card>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <ArtistCampaignList 
                    campaigns={campaigns}
                    isLoading={isLoading}
                    currentlyPlaying={currentlyPlaying}
                    onToggleAudio={toggleAudio}
                    onDeleteCampaign={deleteCampaign}
                  />
                )}
              </div>
             </TabsContent>

            {/* Analytics Profile */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                        <p className="text-2xl font-bold">{stats.averageEngagement.toFixed(1)}%</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Growth</p>
                        <p className="text-2xl font-bold">{stats.monthlyGrowth}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                      </div>
                      <Eye className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-2xl font-bold">156%</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Detailed insights into your campaign performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Advanced analytics dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Creator Relations Profile */}
            <TabsContent value="creators" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Creators</p>
                        <p className="text-2xl font-bold">{stats.totalCreators}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                        <p className="text-2xl font-bold">4.8</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Messages</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <MessageCircle className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Creators</CardTitle>
                  <CardDescription>Your most successful content partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {creatorStats.map((creator) => (
                      <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-smooth">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center">
                            <img src={vuelixLogo} alt="Vuelix" className="w-12 h-12 rounded-full" />
                          </div>
                          <div>
                            <p className="font-semibold">{creator.name}</p>
                            <p className="text-sm text-muted-foreground">{creator.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{creator.totalViews.toLocaleString()} views</p>
                          <p className="text-sm text-muted-foreground">{creator.campaigns} campaigns • ${creator.earnings} earned</p>
                        </div>
                        <Button variant="outline" size="sm">Message</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Profile */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Artist Profile Settings</CardTitle>
                  <CardDescription>Manage your artist profile and account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Profile Information</h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Artist Name</label>
                        <div className="p-3 border rounded-md bg-secondary/20">
                          <p>{user?.name}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <div className="p-3 border rounded-md bg-secondary/20">
                          <p>{user?.email}</p>
                        </div>
                      </div>
                      <Button variant="outline">Edit Profile</Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Campaign Preferences</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Auto-approve creators</span>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email notifications</span>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Payment settings</span>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

export default ArtistDashboard;