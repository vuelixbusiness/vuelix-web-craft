import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import AuthenticatedRoute from "@/components/AuthenticatedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Music,
  Users,
  DollarSign,
  PlayCircle,
  Star,
  Calendar,
  BarChart3,
  Plus,
  Eye,
  Target,
  Award,
  Zap
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalCampaigns: number;
  totalEarnings: number;
  totalViews: number;
  activeCampaigns: number;
}

interface RecentActivity {
  id: string;
  type: 'campaign_join' | 'payout' | 'video_submit';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
}

const AuthenticatedHome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    totalEarnings: 0,
    totalViews: 0,
    activeCampaigns: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const platformIcons = {
    tiktok: <FaTiktok className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    youtube: <FaYoutube className="w-4 h-4" />
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's campaign participations for stats
      const { data: participations } = await supabase
        .from('campaign_participations')
        .select('*, campaigns(*)')
        .eq('creator_id', user?.id);

      // Fetch featured campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          song_title,
          cover_art_url,
          payout_rate,
          payout_type,
          platforms,
          budget,
          profiles!campaigns_artist_id_fkey (
            display_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      // Calculate stats
      const totalCampaigns = participations?.length || 0;
      const totalViews = participations?.reduce((sum, p) => sum + (p.current_views || 0), 0) || 0;
      const totalEarnings = participations?.reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0;
      const activeCampaigns = participations?.filter(p => p.status === 'approved').length || 0;

      setStats({
        totalCampaigns,
        totalEarnings,
        totalViews,
        activeCampaigns
      });

      setFeaturedCampaigns(campaigns || []);

      // Generate some recent activity
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'campaign_join',
          title: 'Joined New Campaign',
          description: 'Successfully joined "Summer Vibes" campaign',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'payout',
          title: 'Payout Received',
          description: 'Payment processed for TikTok campaign',
          amount: 25.00,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setRecentActivity(mockActivity);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-background">
        <DashboardNav dashboardType={user?.type || 'creator'} />
        
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Welcome back, {user?.name || 'User'}!
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {user?.type === 'creator' ? 'Ready to create and earn?' : 'Ready to launch your next campaign?'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user?.membershipType === 'premium' ? 'default' : 'outline'} className="flex items-center space-x-1">
                    {user?.membershipType === 'premium' && <Star className="w-3 h-3" />}
                    <span>{user?.membershipType === 'premium' ? 'VIP Member' : 'Regular Member'}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {user?.type === 'creator' ? 'Total Campaigns' : 'Active Campaigns'}
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    {user?.type === 'creator' ? 'campaigns joined' : 'campaigns running'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">lifetime earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">across all videos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Status</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground">campaigns active</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                    <CardDescription>
                      {user?.type === 'creator' 
                        ? 'Jump into campaigns and start earning' 
                        : 'Manage your campaigns and track performance'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user?.type === 'creator' ? (
                        <>
                          <Link to="/creator-campaigns">
                            <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <Music className="w-6 h-6" />
                              <span>Browse Campaigns</span>
                            </Button>
                          </Link>
                          <Link to="/creator-campaigns?tab=my-videos">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <PlayCircle className="w-6 h-6" />
                              <span>My Videos</span>
                            </Button>
                          </Link>
                          <Link to="/creator-campaigns?tab=earnings">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <DollarSign className="w-6 h-6" />
                              <span>View Earnings</span>
                            </Button>
                          </Link>
                          <Link to="/vuelix-plus">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <Star className="w-6 h-6" />
                              <span>Upgrade to VIP</span>
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/artist-campaign">
                            <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <Plus className="w-6 h-6" />
                              <span>Create Campaign</span>
                            </Button>
                          </Link>
                          <Link to="/artist-dashboard">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <BarChart3 className="w-6 h-6" />
                              <span>Analytics</span>
                            </Button>
                          </Link>
                          <Link to="/artist-dashboard">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <Users className="w-6 h-6" />
                              <span>Manage Creators</span>
                            </Button>
                          </Link>
                          <Link to="/chat">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                              <Music className="w-6 h-6" />
                              <span>AI Assistant</span>
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Campaigns */}
                {user?.type === 'creator' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Featured Campaigns</span>
                      </CardTitle>
                      <CardDescription>Hot campaigns with great earning potential</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-secondary/50 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : featuredCampaigns.length > 0 ? (
                        <div className="space-y-4">
                          {featuredCampaigns.map((campaign) => (
                            <div key={campaign.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-secondary/20 transition-smooth">
                              {campaign.cover_art_url && (
                                <img
                                  src={campaign.cover_art_url}
                                  alt={campaign.song_title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium">{campaign.song_title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  by {campaign.profiles?.display_name || 'Unknown Artist'}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  {campaign.platforms.map((platform: string) => (
                                    <span key={platform} className="text-xs">
                                      {platformIcons[platform as keyof typeof platformIcons]}
                                    </span>
                                  ))}
                                  <Badge variant="secondary" className="text-xs">
                                    ${campaign.payout_rate} per {campaign.payout_type.replace('per_', '')}
                                  </Badge>
                                </div>
                              </div>
                              <Link to="/creator-campaigns">
                                <Button size="sm">Join Now</Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No featured campaigns available right now</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">{activity.description}</p>
                              {activity.amount && (
                                <p className="text-xs text-green-600 font-medium">+${activity.amount}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Membership Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Membership</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                        {user?.membershipType === 'premium' ? (
                          <Star className="w-8 h-8 text-white" />
                        ) : (
                          <Users className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <h3 className="font-medium mb-2">
                        {user?.membershipType === 'premium' ? 'VIP Member' : 'Regular Member'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {user?.membershipType === 'premium' 
                          ? 'Enjoying premium benefits' 
                          : 'Upgrade for exclusive features'
                        }
                      </p>
                      {user?.membershipType !== 'premium' && (
                        <Link to="/vuelix-plus">
                          <Button size="sm" className="w-full">
                            Upgrade to VIP
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

export default AuthenticatedHome;