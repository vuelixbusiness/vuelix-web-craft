import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Music, DollarSign, Users, Filter, Play } from "lucide-react";

const Campaigns = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock campaign data - replace with actual data
  const campaigns = [
    {
      id: '1',
      title: 'Summer Vibes Campaign',
      artist: 'DJ Sunshine',
      genre: 'Electronic',
      payout_rate: 0.05,
      platforms: ['TikTok', 'Instagram'],
      requirements: 'Min 1000 followers',
      status: 'active',
      cover_art_url: null,
    },
    {
      id: '2',
      title: 'Indie Rock Promotion',
      artist: 'The Midnight Band',
      genre: 'Rock',
      payout_rate: 0.08,
      platforms: ['YouTube', 'TikTok'],
      requirements: 'Min 500 followers',
      status: 'active',
      cover_art_url: null,
    },
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Discover Campaigns</h1>
            <p className="text-muted-foreground">
              Find amazing music campaigns and start earning rewards
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns, artists, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Campaigns
                </CardTitle>
                <Music className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">Available to join</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Payout
                </CardTitle>
                <DollarSign className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + c.payout_rate, 0) / campaigns.length).toFixed(3) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Per qualified view</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Creators
                </CardTitle>
                <Users className="w-5 h-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Participating</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <div className="space-y-6">
            {filteredCampaigns.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="text-center py-12">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Check back later for new campaigns.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="shadow-soft hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Campaign Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
                          <Play className="w-8 h-8 text-primary-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold truncate">{campaign.title}</h3>
                            <Badge variant="secondary">{campaign.status}</Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">by {campaign.artist}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline">{campaign.genre}</Badge>
                            {campaign.platforms.map((platform) => (
                              <Badge key={platform} variant="outline">{platform}</Badge>
                            ))}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{campaign.requirements}</p>
                        </div>
                      </div>

                      {/* Campaign Actions */}
                      <div className="flex flex-col items-end space-y-3 lg:min-w-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-500">
                            ${campaign.payout_rate.toFixed(3)}
                          </div>
                          <p className="text-xs text-muted-foreground">per qualified view</p>
                        </div>
                        
                        <Button className="w-full lg:w-auto bg-gradient-primary hover:opacity-90 transition-smooth">
                          Join Campaign
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;