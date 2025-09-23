import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { 
  PlayCircle, 
  DollarSign, 
  Eye, 
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

interface Campaign {
  id: string;
  status: string;
  video_url: string;
  platform: string;
  current_views: number;
  current_likes: number;
  payout_amount: number;
  created_at: string;
  last_tracked_at: string;
  campaigns: {
    song_title: string;
    genre: string;
    end_date?: string;
    profiles: {
      display_name: string;
    } | null;
  };
}

interface QuickStats {
  totalEarnings: number;
  totalViews: number;
  activeCampaigns: number;
  pendingReview: number;
}

const YourCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<QuickStats>({
    totalEarnings: 0,
    totalViews: 0,
    activeCampaigns: 0,
    pendingReview: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const platformIcons = {
    tiktok: <FaTiktok className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    youtube: <FaYoutube className="w-4 h-4" />
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    rejected: <AlertCircle className="w-4 h-4 text-red-500" />
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const fetchCampaigns = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('campaign_participations')
        .select(`
          *,
          campaigns (
            song_title,
            genre,
            end_date,
            profiles!campaigns_artist_id_fkey (display_name)
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const campaignData = (data || []) as any[];
      setCampaigns(campaignData);

      // Calculate stats
      const totalEarnings = campaignData.reduce((sum, c) => sum + (c.payout_amount || 0), 0);
      const totalViews = campaignData.reduce((sum, c) => sum + (c.current_views || 0), 0);
      const activeCampaigns = campaignData.filter(c => c.status === 'approved').length;
      const pendingReview = campaignData.filter(c => c.status === 'pending').length;

      setStats({
        totalEarnings,
        totalViews,
        activeCampaigns,
        pendingReview
      });

    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-secondary rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Campaigns</h2>
          <p className="text-muted-foreground">Overview of your campaign activity and performance</p>
        </div>
        <Button>
          <PlayCircle className="w-4 h-4 mr-2" />
          Browse Campaigns
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
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
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest campaign submissions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <PlayCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by joining your first campaign to see your activity here.
              </p>
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Browse Available Campaigns
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-smooth">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {statusIcons[campaign.status as keyof typeof statusIcons]}
                      <Badge 
                        variant="outline" 
                        className={statusColors[campaign.status as keyof typeof statusColors]}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="font-medium">{campaign.campaigns.song_title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {campaign.campaigns.profiles?.display_name || 'Unknown Artist'}
                      </p>
                    </div>

                    <Badge variant="outline" className="flex items-center space-x-1">
                      {platformIcons[campaign.platform as keyof typeof platformIcons]}
                      <span className="capitalize">{campaign.platform}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-right">
                      <p className="flex items-center text-muted-foreground">
                        <Eye className="w-4 h-4 mr-1" />
                        {campaign.current_views.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="flex items-center text-muted-foreground">
                        <Heart className="w-4 h-4 mr-1" />
                        {campaign.current_likes.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(campaign.payout_amount)}
                      </p>
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      <p className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-smooth cursor-pointer">
          <CardContent className="p-6 text-center">
            <PlayCircle className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">Submit New Video</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Find and join new campaigns to start earning
            </p>
            <Button className="w-full">Browse Campaigns</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-smooth cursor-pointer">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <h3 className="font-semibold mb-2">View Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track your performance and growth metrics
            </p>
            <Button variant="outline" className="w-full">View Analytics</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-smooth cursor-pointer">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="font-semibold mb-2">Earnings Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check your earnings and request payouts
            </p>
            <Button variant="outline" className="w-full">View Earnings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YourCampaigns;