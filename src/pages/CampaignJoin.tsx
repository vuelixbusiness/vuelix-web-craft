import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoSubmission from '@/components/VideoSubmission';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
}

export default function CampaignJoin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Transform the data to match VideoSubmission's expected interface
        const transformedCampaign: Campaign = {
          id: data.id,
          title: data.title || data.song_title || '',
          song_title: data.song_title || '',
          song_url: data.song_url,
          cover_art_url: data.cover_art_url,
          payout_type: data.payout_type || 'per_view',
          payout_rate: data.payout_rate || 0,
          platforms: data.platforms || [],
          instructions: data.instructions || ''
        };
        
        setCampaign(transformedCampaign);
      } catch (error) {
        console.error('Error fetching campaign:', error);
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

    fetchCampaign();
  }, [id, navigate]);

  const handleSubmissionComplete = () => {
    toast({
      title: "Success!",
      description: "Video submitted successfully. We'll review it and get back to you soon!",
    });
    navigate('/campaigns');
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Join Campaign</h1>
            <p className="text-muted-foreground">
              {campaign.song_title}
            </p>
          </div>
        </div>

        {/* Campaign join content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Join "{campaign.song_title}" Campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoSubmission 
              campaign={campaign}
              onSubmissionComplete={handleSubmissionComplete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}