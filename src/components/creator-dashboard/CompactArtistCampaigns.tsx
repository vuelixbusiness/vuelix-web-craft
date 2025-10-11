import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Music, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  cover_art_url: string;
  status: string;
  budget: number;
  payout_rate: number;
  participant_count?: number;
}

const CompactArtistCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchCampaigns();
    }
  }, [user?.id]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          song_title,
          cover_art_url,
          status,
          budget,
          payout_rate
        `)
        .eq('artist_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch participant counts
      const campaignsWithCounts = await Promise.all(
        (data || []).map(async (campaign) => {
          const { count } = await supabase
            .from('campaign_participations')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id);

          return { ...campaign, participant_count: count || 0 };
        })
      );

      setCampaigns(campaignsWithCounts);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          No campaigns created yet
        </p>
        <Button asChild size="sm">
          <Link to="/artist-campaign-flow">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.slice(0, 3).map((campaign) => (
        <div
          key={campaign.id}
          className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img
              src={campaign.cover_art_url || '/placeholder.svg'}
              alt={campaign.song_title}
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{campaign.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {campaign.song_title}
                </Badge>
                <Badge className="text-xs">{campaign.status}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{campaign.participant_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3" />
              <span>${campaign.budget}</span>
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link to="/artist-dashboard">
          View All {campaigns.length > 3 ? campaigns.length : ''} Campaigns
        </Link>
      </Button>
    </div>
  );
};

export default CompactArtistCampaigns;
