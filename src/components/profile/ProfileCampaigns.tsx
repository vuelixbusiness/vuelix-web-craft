import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CampaignCard from "@/components/ui/campaign-card";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url: string;
  cover_art_url: string;
  status: string;
  created_at: string;
  payout_type: string;
  payout_rate: number | null;
  hybrid_reward_description?: string;
  fixed_rate_description?: string;
  budget: number;
  platforms: string[];
  genre: string;
  description?: string;
  rules?: string;
  end_date?: string;
  profiles?: {
    display_name?: string;
    username?: string;
  } | null;
  spent?: number;
  actualSpent?: number;
  redeemed?: number;
  availableBudget?: number;
  budgetUsedPercentage?: number;
  views?: number;
  totalViews?: number;
  activeCreators?: number;
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
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        .select(`
          id,
          title,
          song_title,
          song_url,
          cover_art_url,
          status,
          created_at,
          payout_type,
          payout_rate,
          hybrid_reward_description,
          fixed_rate_description,
          budget,
          platforms,
          genre,
          instructions,
          rules,
          end_date,
          artist_id
        `)
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        createdQuery = createdQuery.limit(limit);
      }

      const { data: created } = await createdQuery;

      // Calculate budget statistics for each campaign
      const campaignsWithStats = await Promise.all(
        (created || []).map(async (campaign) => {
          // Get total spent/redeemed from participations
          const { data: participations } = await supabase
            .from('campaign_participations')
            .select('payout_amount, payout_claimed')
            .eq('campaign_id', campaign.id);

          const redeemed = participations?.reduce(
            (sum, p) => sum + (p.payout_claimed ? Number(p.payout_amount) : 0),
            0
          ) || 0;

          const availableBudget = Number(campaign.budget) - redeemed;
          const budgetUsedPercentage = (redeemed / Number(campaign.budget)) * 100;

          return {
            ...campaign,
            redeemed,
            availableBudget,
            budgetUsedPercentage,
          };
        })
      );

      setCreatedCampaigns(campaignsWithStats);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {createdCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  variant="creator-available"
                  showPlayButton={true}
                  showJoinButton={false}
                  onCampaignClick={() => navigate(`/artist/campaign/${campaign.id}`)}
                  onAudioToggle={toggleAudio}
                  isPlaying={currentlyPlaying === campaign.id}
                />
              ))}
            </div>
            <audio
              ref={audioRef}
              onEnded={() => setCurrentlyPlaying(null)}
              onError={() => setCurrentlyPlaying(null)}
            />
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
