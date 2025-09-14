import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { 
  Music, 
  Plus, 
  TrendingUp, 
  Users, 
  Play, 
  Eye, 
  Heart, 
  DollarSign,
  Target,
  BarChart3,
  Settings,
  Zap,
  Star
} from "lucide-react";

const ArtistLanding = () => {
  const navigate = useNavigate();

  const featuredCampaigns = [
    {
      id: 1,
      songTitle: "Midnight Vibes",
      status: "Active",
      budget: 500,
      spent: 247.50,
      creators: 12,
      videos: 18,
      views: 45600,
      likes: 3200,
      genre: "Electronic"
    },
    {
      id: 2,
      songTitle: "Summer Dreams", 
      status: "Completed",
      budget: 300,
      spent: 300,
      creators: 8,
      videos: 15,
      views: 28900,
      likes: 2100,
      genre: "Indie Pop"
    },
    {
      id: 3,
      songTitle: "Electric Nights",
      status: "Draft",
      budget: 750,
      spent: 0,
      creators: 0,
      videos: 0,
      views: 0,
      likes: 0,
      genre: "Hip Hop"
    }
  ];

  const stats = {
    totalArtists: 2400,
    activeCampaigns: 156,
    totalViews: 3200000,
    successRate: 94
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Artist Central
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Launch powerful music campaigns, connect with content creators, and amplify your music across all platforms. 
              Turn your tracks into viral sensations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/artist-campaign')}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Campaign</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalArtists.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Active Artists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.activeCampaigns}</div>
              <div className="text-sm text-muted-foreground">Live Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{(stats.totalViews / 1000000).toFixed(1)}M+</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Campaign Management Hub</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create, manage, and optimize your music campaigns in one place
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-smooth cursor-pointer" onClick={() => navigate('/artist-campaign')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Create Campaign</h3>
                  <p className="text-sm text-muted-foreground">Launch a new music promotion campaign</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-smooth cursor-pointer" onClick={() => navigate('/artist-dashboard')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance and insights</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-smooth cursor-pointer" onClick={() => navigate('/artist-dashboard')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Manage Creators</h3>
                  <p className="text-sm text-muted-foreground">Connect with content creators</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-smooth cursor-pointer" onClick={() => navigate('/chat')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">Get campaign optimization tips</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sample Campaigns */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Active Campaigns</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how other artists are promoting their music and getting results
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-smooth">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{campaign.songTitle}</CardTitle>
                          <CardDescription>{campaign.genre}</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={campaign.status === 'Active' ? 'default' : 
                                 campaign.status === 'Completed' ? 'secondary' : 'outline'}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Budget Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Used</span>
                        <span>${campaign.spent} / ${campaign.budget}</span>
                      </div>
                      <Progress 
                        value={(campaign.spent / campaign.budget) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold">{campaign.views.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{campaign.creators}</p>
                        <p className="text-xs text-muted-foreground">Creators</p>
                      </div>
                    </div>
                    
                    {/* Action */}
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-secondary/20 rounded-2xl p-8 md:p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Artists Choose Vuelix</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powerful tools and features designed specifically for music promotion
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Targeted Reach</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with creators who match your genre and audience
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track views, engagement, and ROI across all platforms
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Budget Control</h3>
                <p className="text-sm text-muted-foreground">
                  Set budgets, track spending, and optimize campaign costs
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Amplify Your Music?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of artists who are already growing their fanbase with Vuelix campaigns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/artist-campaign')}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Campaign</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistLanding;