import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  cover_art_url: string;
  status: string;
  created_at: string;
  payout_type: string;
  platforms: string[];
}

interface ProfileCampaignsProps {
  userId: string;
  limit?: number;
}

export function ProfileCampaigns({ userId, limit }: ProfileCampaignsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createdCampaigns, setCreatedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchCampaigns();
  }, [userId, limit]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);

      // Fetch campaigns created by user
      let createdQuery = supabase
        .from('campaigns')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        createdQuery = createdQuery.limit(limit);
      }

      const { data: created } = await createdQuery;

      setCreatedCampaigns(created || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaigns Created */}
      {createdCampaigns.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Music2 className="w-5 h-5" />
              Campaigns Created
            </CardTitle>
            {isOwnProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/artist-campaign-flow')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => navigate(`/artist/campaign/${campaign.id}`)}
                  className="border border-border rounded-lg overflow-hidden hover:shadow-soft transition-smooth cursor-pointer"
                >
                  {campaign.cover_art_url ? (
                    <img
                      src={campaign.cover_art_url}
                      alt={campaign.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-primary/10 flex items-center justify-center">
                      <Music2 className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-medium mb-1 truncate">{campaign.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {campaign.song_title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {campaign.payout_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Campaigns</CardTitle>
            {isOwnProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/artist-campaign-flow')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No campaigns created yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
