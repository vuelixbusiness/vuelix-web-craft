import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Search, TrendingUp, DollarSign, Video, Music, Eye, Heart, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import VideoSubmission from "@/components/VideoSubmission";

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          profiles!campaigns_artist_id_fkey(display_name, username)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setDialogOpen(true);
  };

  const handleSubmissionComplete = () => {
    setDialogOpen(false);
    setSelectedCampaign(null);
    toast({
      title: "Success!",
      description: "Your video has been submitted for review.",
    });
  };

  const stats = {
    totalEarnings: 1247.50,
    thisMonthEarnings: 485.30,
    videosSubmitted: 23,
    campaignsJoined: 8
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted-foreground">
            Ready to create amazing content and earn from your creativity?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${stats.thisMonthEarnings}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Videos Created</p>
                  <p className="text-2xl font-bold">{stats.videosSubmitted}</p>
                </div>
                <Video className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{stats.campaignsJoined}</p>
                </div>
                <Music className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        {/* Available Campaigns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Available Campaigns</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-smooth cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img 
                        src={campaign.cover_art_url || "https://api.dicebear.com/7.x/shapes/svg?seed=" + campaign.id} 
                        alt={campaign.profiles?.display_name || "Artist"}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{campaign.song_title}</h3>
                        <p className="text-sm text-muted-foreground">by {campaign.profiles?.display_name || "Unknown Artist"}</p>
                      </div>
                      {campaign.song_url && (
                        <Button size="icon" variant="ghost">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{campaign.genre}</Badge>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Per 1K views</p>
                          <p className="font-semibold text-green-600">${campaign.payout_rate}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {campaign.platforms?.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {campaign.instructions || "Follow campaign guidelines"}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Max: ${campaign.max_payout}</span>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                      </div>
                      
                      <Dialog open={dialogOpen && selectedCampaign?.id === campaign.id} onOpenChange={(open) => {
                        if (!open) {
                          setDialogOpen(false);
                          setSelectedCampaign(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button className="w-full mt-4" onClick={() => handleJoinCampaign(campaign)}>
                            Join Campaign
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Submit Your Video</DialogTitle>
                          </DialogHeader>
                          {selectedCampaign && (
                            <VideoSubmission 
                              campaign={selectedCampaign} 
                              onSubmissionComplete={handleSubmissionComplete}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatorDashboard;