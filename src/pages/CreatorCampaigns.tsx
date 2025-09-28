import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

import ViewTracker from "@/components/ViewTracker";
import { 
  Search, 
  Filter, 
  PlayCircle, 
  DollarSign, 
  Eye, 
  Music,
  Calendar,
  Target
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
  budget: number;
  end_date: string;
  profiles?: {
    display_name?: string;
  } | null;
}

const CreatorCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-videos' | 'earnings'>('browse');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
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
          profiles!campaigns_artist_id_fkey (
            display_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map instructions to description for campaign cards
      const campaignsWithDescriptions = (data || []).map(campaign => ({
        ...campaign,
        description: campaign.instructions
      }));
      
      setCampaigns(campaignsWithDescriptions as Campaign[]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.song_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.profiles?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !selectedPlatform || campaign.platforms.includes(selectedPlatform);
    return matchesSearch && matchesPlatform;
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view campaigns</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Creator Dashboard</h1>
            <p className="text-xl text-muted-foreground">Find campaigns, track views, and earn from your content</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center bg-secondary rounded-lg p-1">
              {[
                { key: 'browse', label: 'Browse Campaigns', icon: Search },
                { key: 'my-videos', label: 'My Videos', icon: PlayCircle },
                { key: 'earnings', label: 'Earnings', icon: DollarSign }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-smooth ${
                    activeTab === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Browse Campaigns Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by song, artist, or genre..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </Button>
                </div>

                {/* Platform Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
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
              </div>

              {/* Campaigns Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-4 bg-secondary rounded animate-pulse mb-2" />
                        <div className="h-3 bg-secondary/60 rounded animate-pulse w-2/3" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-secondary/40 rounded animate-pulse" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-lg transition-smooth">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{campaign.song_title}</CardTitle>
                            <CardDescription>by {campaign.profiles?.display_name || 'Unknown Artist'}</CardDescription>
                          </div>
                           {campaign.cover_art_url && (
                             <div className="w-12 h-12 rounded object-cover relative">
                               <img
                                 src={campaign.cover_art_url}
                                 alt={campaign.song_title}
                                 className="w-12 h-12 rounded object-cover"
                               />
                               {/* Icon Box Overlay */}
                               <div className="absolute -top-1 -right-1 w-5 h-5 rounded-sm bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                                 <Music className="w-2.5 h-2.5 text-primary" />
                               </div>
                             </div>
                           )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Platforms */}
                        <div className="flex flex-wrap gap-1">
                          {campaign.platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="flex items-center space-x-1">
                              {platformIcons[platform as keyof typeof platformIcons]}
                              <span className="text-xs">{platformNames[platform as keyof typeof platformNames]}</span>
                            </Badge>
                          ))}
                        </div>

                        {/* Payout Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-sm">
                              ${campaign.payout_rate} per 1,000 Views
                            </span>
                          </div>
                          {user?.membershipType === 'premium' && campaign.vip_bonus && (
                            <Badge variant="secondary" className="text-xs">
                              +${campaign.vip_bonus} VIP
                            </Badge>
                          )}
                        </div>

                        {/* Budget & Deadline */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Budget: ${campaign.budget.toLocaleString()}</span>
                          </div>
                          {campaign.end_date && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Ends: {new Date(campaign.end_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Instructions Preview */}
                        {campaign.instructions && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {campaign.instructions}
                          </p>
                        )}

                        {/* Apply Button */}
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            window.location.href = `/campaign/${campaign.id}/join`;
                          }}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Join Campaign
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && filteredCampaigns.length === 0 && (
                <Card className="text-center py-8">
                  <CardContent>
                    <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters to find campaigns.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* My Videos Tab */}
          {activeTab === 'my-videos' && (
            <div className="max-w-4xl mx-auto">
              <ViewTracker />
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span>Earnings Dashboard</span>
                  </CardTitle>
                  <CardDescription>
                    Track your total earnings from all campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Earnings Summary Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Detailed earnings analytics will be available here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorCampaigns;