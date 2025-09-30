import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music2, Eye, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [createdCampaigns, setCreatedCampaigns] = useState<Campaign[]>([]);
  const [participatedCampaigns, setParticipatedCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      // Fetch campaigns participated in
      let participatedQuery = supabase
        .from('campaign_participations')
        .select(`
          *,
          campaigns:campaign_id (
            id,
            title,
            song_title,
            cover_art_url,
            status,
            created_at
          )
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        participatedQuery = participatedQuery.limit(limit);
      }

      const { data: participated } = await participatedQuery;

      setCreatedCampaigns(created || []);
      setParticipatedCampaigns(participated || []);
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
      {createdCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="w-5 h-5" />
              Campaigns Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-border rounded-lg overflow-hidden hover:shadow-soft transition-smooth"
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
      )}

      {/* Campaigns Participated */}
      {participatedCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Campaigns Participated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {participatedCampaigns.map((participation) => {
                const campaign = participation.campaigns;
                if (!campaign) return null;
                
                return (
                  <div
                    key={participation.id}
                    className="flex items-center gap-4 p-3 border border-border rounded-lg hover:shadow-soft transition-smooth"
                  >
                    {campaign.cover_art_url ? (
                      <img
                        src={campaign.cover_art_url}
                        alt={campaign.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-primary/10 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-primary/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{campaign.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {campaign.song_title}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {participation.current_views || 0} views
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {participation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {createdCampaigns.length === 0 && participatedCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              No campaign activity yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
