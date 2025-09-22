import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Music, Users, TrendingUp, Play, Eye, Heart, BarChart3, MessageCircle, Settings, Star, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import vuelixLogo from "@/assets/vuelix-logo-v.png";

type DashboardProfile = 'campaigns' | 'analytics' | 'creators' | 'settings';

const ArtistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeProfile, setActiveProfile] = useState<DashboardProfile>('campaigns');

  const campaigns = [
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
    totalCampaigns: 8,
    activeCampaigns: 3,
    totalViews: 156780,
    totalSpent: 2347.50,
    totalCreators: 34,
    averageEngagement: 4.2,
    monthlyGrowth: 12.5
  };

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
                Switch between different dashboard views to manage your music career
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
                        <p className="text-2xl font-bold">${stats.totalSpent}</p>
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
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button variant="outline" size="sm">Sort</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-lg transition-smooth">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                              <img src={vuelixLogo} alt="Vuelix" className="w-10 h-10" />
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-lg font-semibold">{campaign.creators}</p>
                            <p className="text-xs text-muted-foreground">Creators</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{campaign.videos}</p>
                            <p className="text-xs text-muted-foreground">Videos</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{campaign.views.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Views</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{campaign.likes.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Likes</p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                          {campaign.status === 'Active' && (
                            <Button variant="outline" size="sm" className="flex-1">
                              Manage
                            </Button>
                          )}
                          {campaign.status === 'Draft' && (
                            <Button size="sm" className="flex-1">
                              Launch
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                        <p className="text-2xl font-bold">{stats.averageEngagement}</p>
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
    </DashboardLayout>
  );
};

export default ArtistDashboard;