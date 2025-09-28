import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CampaignHubLayout } from '@/components/campaign-hub/CampaignHubLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  cover_art_url?: string;
  payout_type: string;
  payout_rate: number;
  platforms: string[];
  instructions: string;
  rules?: string;
  budget?: number;
  end_date?: string;
  status?: string;
  genre?: string;
  vip_bonus?: number;
  max_payout?: number;
  vip_max_payout?: number;
  artist_id: string;
  created_at: string;
}

interface Participation {
  id: string;
  status: string;
  created_at: string;
  payout_claimed: boolean;
  payout_amount: number;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

export default function CampaignJoin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id, navigate, user]);

  const handleSubmissionComplete = () => {
    toast({
      title: "Success!",
      description: "Video submitted successfully. We'll review it and get back to you soon!",
    });
    // Refresh participation data
    if (user) {
      supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', id)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setParticipation({
              id: data.id,
              status: data.status,
              created_at: data.created_at,
              payout_claimed: data.payout_claimed,
              payout_amount: data.payout_amount
            });
          }
        });
    }
  };

  const fetchData = async () => {
    if (!id || !user) return;
    
    try {
      // Fetch campaign data
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (campaignError) throw campaignError;
      
      const transformedCampaign: Campaign = {
        id: campaignData.id,
        title: campaignData.title || campaignData.song_title || '',
        song_title: campaignData.song_title || '',
        song_url: campaignData.song_url,
        cover_art_url: campaignData.cover_art_url,
        payout_type: campaignData.payout_type || 'per_view',
        payout_rate: campaignData.payout_rate || 0,
        platforms: campaignData.platforms || [],
        instructions: campaignData.instructions || '',
        rules: campaignData.rules,
        budget: campaignData.budget,
        end_date: campaignData.end_date,
        status: campaignData.status,
        genre: campaignData.genre,
        vip_bonus: campaignData.vip_bonus,
        max_payout: campaignData.max_payout,
        vip_max_payout: campaignData.vip_max_payout,
        artist_id: campaignData.artist_id,
        created_at: campaignData.created_at
      };
      
      setCampaign(transformedCampaign);

      // Fetch media assets for this campaign
      const { data: mediaAssetsData, error: mediaAssetsError } = await supabase
        .from('media_assets')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });

      if (mediaAssetsError && mediaAssetsError.code !== 'PGRST116') {
        console.error('Error fetching media assets:', mediaAssetsError);
      } else if (mediaAssetsData) {
        setMediaAssets(mediaAssetsData);
      }

      // Check if user has already joined this campaign
      const { data: participationData, error: participationError } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', id)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (participationError && participationError.code !== 'PGRST116') {
        throw participationError;
      }

      if (participationData) {
        setParticipation({
          id: participationData.id,
          status: participationData.status,
          created_at: participationData.created_at,
          payout_claimed: participationData.payout_claimed,
          payout_amount: participationData.payout_amount
        });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCampaign = async (campaign: Campaign) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join this campaign",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already has a participation record
      const { data: existingParticipation } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('creator_id', user.id)
        .maybeSingle();

      if (existingParticipation) {
        toast({
          title: "Already Joined",
          description: "You've already joined this campaign!",
        });
        return;
      }

      // Create participation record without requiring video submission
      const { data, error } = await supabase
        .from('campaign_participations')
        .insert({
          campaign_id: campaign.id,
          creator_id: user.id,
          status: 'joined',
          video_url: null,
          platform: null
        })
        .select()
        .single();

      if (error) {
        console.error("Error joining campaign:", error);
        toast({
          title: "Error",
          description: "Failed to join campaign. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully joined campaign:", data);
      toast({
        title: "Success!",
        description: "Successfully joined campaign!",
      });
      
      // Refresh the data to show updated participation status
      await fetchData();
    } catch (error) {
      console.error("Error joining campaign:", error);
      toast({
        title: "Error",
        description: "Failed to join campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/campaigns')}>
              Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CampaignHubLayout
      campaign={campaign}
      participation={participation}
      mediaAssets={mediaAssets}
      onBack={handleBack}
      onSubmissionComplete={handleSubmissionComplete}
      onJoinCampaign={handleJoinCampaign}
    />
  );
}