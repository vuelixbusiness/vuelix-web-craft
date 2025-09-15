import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Play, Users, Award, TrendingUp, Music, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  genre: string;
  payout_rate: number;
  platforms: string[];
  status: string;
}

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalEarnings: 0,
    totalViews: 0,
    activeCampaigns: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHomeData();
  }, [user, navigate]);

  const fetchHomeData = async () => {
    try {
      // Fetch featured campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .limit(6);

      if (campaigns) {
        setFeaturedCampaigns(campaigns);
      }

      // Fetch user stats if user exists
      if (user) {
        const { data: participations } = await supabase
          .from('campaign_participations')
          .select('*')
          .eq('creator_id', user.id);

        if (participations) {
          const totalEarnings = participations.reduce((sum, p) => sum + (Number(p.payout_amount) || 0), 0);
          const totalViews = participations.reduce((sum, p) => sum + (p.current_views || 0), 0);
          const activeCampaigns = participations.filter(p => p.status === 'active').length;

          setStats({
            totalCampaigns: participations.length,
            totalEarnings,
            totalViews,
            activeCampaigns
          });
        }
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Your {user.type === 'creator' ? 'content creation' : 'music promotion'} hub
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {user.membershipType === 'premium' ? 'Premium' : 'Regular'} {user.type}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.type === 'creator' ? 'Campaigns Joined' : 'Active Campaigns'}
              </CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.type === 'creator' ? 'Total Earnings' : 'Total Budget'}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.type === 'creator' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full" onClick={() => navigate('/campaigns')}>
                    Browse Campaigns
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/creator-dashboard')}>
                    My Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/leaderboard')}>
                    View Leaderboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/chat')}>
                    Community Chat
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full" onClick={() => navigate('/artist-campaign')}>
                    Create Campaign
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/artist-dashboard')}>
                    My Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/campaigns')}>
                    View All Campaigns
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/chat')}>
                    Community Chat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <Badge variant={user.membershipType === 'premium' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {user.membershipType === 'premium' ? 'Premium Member' : 'Regular Member'}
                </Badge>
                {user.membershipType === 'regular' && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/vuelix-plus')}>
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Campaigns */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Featured Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.song_title}</CardTitle>
                    <Badge variant="secondary">{campaign.genre}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Payout: ${campaign.payout_rate}/1k views
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {campaign.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full mt-4" size="sm" onClick={() => navigate('/campaigns')}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;