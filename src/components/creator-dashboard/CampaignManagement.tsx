import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import VideoSubmission from "@/components/VideoSubmission";
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
  budget: number;
  end_date: string;
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
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id, title, song_title, song_url, cover_art_url, campaign_type,
          genre, platforms, payout_type, payout_rate, vip_bonus,
          max_payout, vip_max_payout, instructions, budget, end_date,
          profiles!campaigns_artist_id_fkey (display_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
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
      const { data, error } = await supabase
        .from('campaign_participations')
        .select(`
          *, 
          campaigns (
            id, title, song_title, cover_art_url, genre,
            profiles!campaigns_artist_id_fkey (display_name)
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipations((data || []) as any[]);
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.song_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.profiles?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !selectedPlatform || campaign.platforms.includes(selectedPlatform);
    return matchesSearch && matchesPlatform;
  });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchCampaigns(), fetchParticipations()]).finally(() => {
      setIsLoading(false);
    });
  }, [user?.id]);

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
          <TabsTrigger value="active">Active ({participations.filter(p => p.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({participations.filter(p => p.status === 'pending').length})</TabsTrigger>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-secondary rounded mb-2" />
                    <div className="h-3 bg-secondary/60 rounded w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-secondary/40 rounded" />
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
                        <img
                          src={campaign.cover_art_url}
                          alt={campaign.song_title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {campaign.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="flex items-center space-x-1">
                          {platformIcons[platform as keyof typeof platformIcons]}
                          <span className="text-xs">{platformNames[platform as keyof typeof platformNames]}</span>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-medium">
                          ${campaign.payout_rate} per {campaign.payout_type.replace('per_', '')}
                        </span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedCampaign(campaign)}>
                          <PlayCircle className="w-4 h-4 mr-2" />
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
                              fetchParticipations();
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {participations.filter(p => p.status === 'approved').map((participation) => (
              <Card key={participation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{participation.campaigns.song_title}</CardTitle>
                      <CardDescription>Active Campaign</CardDescription>
                    </div>
                    {statusIcons[participation.status as keyof typeof statusIcons]}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-semibold flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {participation.current_views.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Earnings</p>
                      <p className="font-semibold text-green-600">
                        ${participation.payout_amount}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                    {platformIcons[participation.platform as keyof typeof platformIcons]}
                    <span>{platformNames[participation.platform as keyof typeof platformNames]}</span>
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {participations.filter(p => p.status === 'pending').map((participation) => (
              <Card key={participation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{participation.campaigns.song_title}</CardTitle>
                      <CardDescription>Awaiting Review</CardDescription>
                    </div>
                    {statusIcons[participation.status as keyof typeof statusIcons]}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                    {platformIcons[participation.platform as keyof typeof platformIcons]}
                    <span>{platformNames[participation.platform as keyof typeof platformNames]}</span>
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Submitted {new Date(participation.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
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
    </div>
  );
};

export default CampaignManagement;