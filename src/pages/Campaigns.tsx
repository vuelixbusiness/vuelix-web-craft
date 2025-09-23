import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import VideoSubmission from "@/components/VideoSubmission";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Music, DollarSign, Users, Filter, Play } from "lucide-react";
import vuelixLogo from "@/assets/vuelix-logo-v.png";

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

const Campaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
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

      if (campaignsError) throw campaignsError;

      // Then get artist profiles for the campaigns
      const artistIds = [...new Set(campaignsData?.map(c => c.artist_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', artistIds);

      // Merge the data
      const campaignsWithProfiles = campaignsData?.map(campaign => ({
        ...campaign,
        profiles: profilesData?.find(p => p.user_id === campaign.artist_id) || null
      })) || [];

      setCampaigns(campaignsWithProfiles as Campaign[]);
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

  useEffect(() => {
    fetchCampaigns();
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

          {/* Campaigns List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-soft">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary/60 rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="shadow-soft">
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
                <Card key={campaign.id} className="shadow-soft hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Campaign Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-soft">
                          {campaign.cover_art_url ? (
                            <img src={campaign.cover_art_url} alt={campaign.song_title} className="w-16 h-16 rounded-lg object-cover" />
                          ) : (
                            <img src={vuelixLogo} alt="Vuelix" className="w-16 h-16" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold truncate">{campaign.song_title}</h3>
                            <Badge variant="secondary">active</Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">by {campaign.profiles?.display_name || 'Unknown Artist'}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline">{campaign.genre}</Badge>
                            {campaign.platforms.map((platform) => (
                              <Badge key={platform} variant="outline">{platform}</Badge>
                            ))}
                          </div>
                          
                          {campaign.instructions && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{campaign.instructions}</p>
                          )}
                        </div>
                      </div>

                      {/* Campaign Actions */}
                      <div className="flex flex-col items-end space-y-3 lg:min-w-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-500">
                            ${campaign.payout_rate.toFixed(3)}
                          </div>
                          <p className="text-xs text-muted-foreground">per {campaign.payout_type.replace('per_', '')}</p>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full lg:w-auto bg-gradient-primary hover:opacity-90 transition-smooth"
                              onClick={() => setSelectedCampaign(campaign)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Join Campaign
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Join "{campaign.song_title}" Campaign</DialogTitle>
                            </DialogHeader>
                            {selectedCampaign && (
                              <VideoSubmission 
                                campaign={selectedCampaign}
                                onSubmissionComplete={() => {
                                  toast({
                                    title: "Success!",
                                    description: "Video submitted successfully"
                                  });
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;