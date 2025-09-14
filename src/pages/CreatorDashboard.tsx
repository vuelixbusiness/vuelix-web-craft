import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Search, TrendingUp, DollarSign, Video, Music, Eye, Heart, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const campaigns = [
    {
      id: 1,
      artist: "DJ Luna",
      songTitle: "Midnight Vibes",
      genre: "Electronic",
      payoutRate: 2.50,
      maxPayout: 99.99,
      platforms: ["TikTok", "Instagram"],
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=luna",
      requirements: "30s+ video, use audio for at least 15s"
    },
    {
      id: 2,
      artist: "The Echoes",
      songTitle: "Summer Dreams",
      genre: "Indie Pop",
      payoutRate: 3.00,
      maxPayout: 75.00,
      platforms: ["YouTube", "TikTok"],
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=echoes",
      requirements: "Creative interpretation welcome"
    },
    {
      id: 3,
      artist: "Bass Drop",
      songTitle: "Electric Nights",
      genre: "Hip Hop",
      payoutRate: 4.25,
      maxPayout: 150.00,
      platforms: ["TikTok"],
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=bass",
      requirements: "Dance/choreo preferred"
    }
  ];

  const stats = {
    totalEarnings: 1247.50,
    thisMonthEarnings: 485.30,
    videosSubmitted: 23,
    campaignsJoined: 8
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav dashboardType="creator" />

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-smooth cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={campaign.image} 
                      alt={campaign.artist}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{campaign.songTitle}</h3>
                      <p className="text-sm text-muted-foreground">by {campaign.artist}</p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{campaign.genre}</Badge>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Per 1K views</p>
                        <p className="font-semibold text-green-600">${campaign.payoutRate}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {campaign.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {campaign.requirements}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Max: ${campaign.maxPayout}</span>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-3 h-3" />
                        <span>24 creators</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">
                      Join Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;