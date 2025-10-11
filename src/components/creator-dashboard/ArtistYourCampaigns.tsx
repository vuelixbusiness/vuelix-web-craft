import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Music, TrendingUp, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import ArtistCampaignList from "@/components/ArtistCampaignList";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  status: string;
  budget: number;
  genre: string;
  created_at: string;
  payout_type: string;
  platforms: string[];
  cover_art_url?: string;
  artist_id: string;
  actualSpent?: number;
  estimatedPending?: number;
  totalViews?: number;
  totalLikes?: number;
  creatorCount?: number;
  availableBudget?: number;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalViews: number;
  totalSpent: number;
}

const ArtistYourCampaigns = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalViews: 0,
    totalSpent: 0,
  });

  const fetchCampaigns = async () => {
    if (!user?.id) return;

    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignError) {
        toast({
          title: "Error Loading Campaigns",
          description: "Failed to load your campaigns. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const { data: spendingData, error: spendingError } = await supabase
        .from('campaign_participations')
        .select(`
          campaign_id,
          payout_amount,
          payout_claimed,
          current_views,
          current_likes,
          creator_id
        `)
        .in('campaign_id', campaignData?.map(c => c.id) || []);

      if (spendingError) {
        console.error('Error fetching spending data:', spendingError);
      }

      const campaignsWithSpending = campaignData?.map(campaign => {
        const participations = spendingData?.filter(p => p.campaign_id === campaign.id) || [];
        const totalSpent = participations
          .filter(p => p.payout_claimed)
          .reduce((sum, p) => sum + (Number(p.payout_amount) || 0), 0);
        const estimatedPending = participations
          .filter(p => !p.payout_claimed && p.payout_amount > 0)
          .reduce((sum, p) => sum + (Number(p.payout_amount) || 0), 0);
        const totalViews = participations.reduce((sum, p) => sum + (Number(p.current_views) || 0), 0);
        const totalLikes = participations.reduce((sum, p) => sum + (Number(p.current_likes) || 0), 0);
        const creatorCount = new Set(participations.map(p => p.creator_id)).size;

        return {
          ...campaign,
          actualSpent: totalSpent,
          estimatedPending: estimatedPending,
          totalViews: totalViews,
          totalLikes: totalLikes,
          creatorCount: creatorCount,
          availableBudget: Number(campaign.budget) - totalSpent - estimatedPending
        };
      }) || [];

      setCampaigns(campaignsWithSpending);
      
      if (campaignsWithSpending) {
        const activeCampaigns = campaignsWithSpending.filter(c => c.status === 'active').length;
        const totalActualSpent = campaignsWithSpending.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
        const totalViews = campaignsWithSpending.reduce((sum, c) => sum + (c.totalViews || 0), 0);
        
        setStats({
          totalCampaigns: campaignsWithSpending.length,
          activeCampaigns,
          totalViews: totalViews,
          totalSpent: totalActualSpent,
        });
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading campaigns.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();

    if (!user?.id) return;

    const channel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          fetchCampaigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const toggleAudio = (campaignId: string, songUrl: string) => {
    if (!audioRef.current) return;

    if (currentlyPlaying === campaignId) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying) {
        audioRef.current.pause();
      }
      audioRef.current.src = songUrl;
      audioRef.current.play();
      setCurrentlyPlaying(campaignId);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('artist_id', user.id);

      if (error) {
        toast({
          title: "Error Deleting Campaign",
          description: "Failed to delete the campaign. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Campaign Deleted",
        description: "The campaign has been permanently deleted.",
      });

      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the campaign.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Campaigns</h2>
          <p className="text-muted-foreground">Manage and monitor your music campaigns</p>
        </div>
        <Button onClick={() => navigate('/artist-campaign')} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>
      </div>

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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <ArtistCampaignList 
        campaigns={campaigns}
        isLoading={isLoading}
        currentlyPlaying={currentlyPlaying}
        onToggleAudio={toggleAudio}
        onDeleteCampaign={deleteCampaign}
      />

      <audio ref={audioRef} />
    </div>
  );
};

export default ArtistYourCampaigns;
