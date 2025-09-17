import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNav from "@/components/DashboardNav";
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

const Homepage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    totalEarnings: 0,
    totalViews: 0,
    activeCampaigns: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user participations for stats
      const { data: participations } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('creator_id', user?.id);

      // Calculate stats
      const totalEarnings = participations?.reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0;
      const totalViews = participations?.reduce((sum, p) => sum + (p.current_views || 0), 0) || 0;
      
      setStats({
        totalCampaigns: participations?.length || 0,
        totalEarnings,
        totalViews,
        activeCampaigns: participations?.filter(p => p.status === 'active').length || 0,
      });

      // Fetch featured campaigns (for creators)
      if (user?.type === 'creator') {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('*')
          .eq('status', 'active')
          .limit(3);
        
        setFeaturedCampaigns(campaigns || []);
      }

      // Mock recent activity data
      setRecentActivity([
        {
          id: '1',
          type: 'campaign_join',
          title: 'Joined New Campaign',
          description: 'Successfully joined "Summer Vibes" campaign',
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          type: 'payout',
          title: 'Payout Received',
          description: 'Earned from campaign completion',
          amount: 25.50,
          timestamp: '1 day ago'
        },
        {
          id: '3',
          type: 'video_submit',
          title: 'Video Submitted',
          description: 'Submitted content for review',
          timestamp: '3 days ago'
        }
      ]);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl font-medium text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
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
                <p className="text-xs text-muted-foreground">across all content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">currently active</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
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
                        <Link to="/creator-dashboard">
                          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                            <BarChart3 className="w-6 h-6" />
                            <span>View Analytics</span>
                          </Button>
                        </Link>
                        <Link to="/leaderboard">
                          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                            <Award className="w-6 h-6" />
                            <span>Leaderboard</span>
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
                            <span>View Analytics</span>
                          </Button>
                        </Link>
                        <Link to="/campaigns">
                          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                            <Calendar className="w-6 h-6" />
                            <span>Manage Campaigns</span>
                          </Button>
                        </Link>
                        <Link to="/vuelix-plus">
                          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                            <Star className="w-6 h-6" />
                            <span>Upgrade to VIP</span>
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
                    <CardDescription>
                      Hot campaigns with great earning potential
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : featuredCampaigns.length > 0 ? (
                      <div className="space-y-4">
                        {featuredCampaigns.map((campaign, index) => (
                          <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium">{campaign.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {campaign.song_title} • {campaign.genre}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  {campaign.platforms?.includes('tiktok') && <FaTiktok className="w-4 h-4" />}
                                  {campaign.platforms?.includes('instagram') && <FaInstagram className="w-4 h-4" />}
                                  {campaign.platforms?.includes('youtube') && <FaYoutube className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">${campaign.payout_rate}/video</div>
                              <Link to="/creator-campaigns">
                                <Button size="sm" className="mt-2">
                                  Join Campaign
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No featured campaigns right now</p>
                        <Link to="/creator-campaigns">
                          <Button variant="outline" className="mt-4">
                            Browse All Campaigns
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          {activity.type === 'campaign_join' && <Target className="w-4 h-4" />}
                          {activity.type === 'payout' && <DollarSign className="w-4 h-4" />}
                          {activity.type === 'video_submit' && <PlayCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          {activity.amount && (
                            <p className="text-xs font-medium text-primary">+${activity.amount}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Membership Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Membership Status</span>
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
  );
};

export default Homepage;