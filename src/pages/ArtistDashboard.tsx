import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Music, Users, TrendingUp, Play, Eye, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";

const ArtistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    totalSpent: 2347.50
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav dashboardType="artist" />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 🎵</h1>
            <p className="text-muted-foreground">
              Manage your music campaigns and track their performance
            </p>
          </div>
          <Button onClick={() => navigate('/artist-campaign')} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <h2 className="text-2xl font-bold">Your Campaigns</h2>
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
      </div>
    </div>
  );
};

export default ArtistDashboard;