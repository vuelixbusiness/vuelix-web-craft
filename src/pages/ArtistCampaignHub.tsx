import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useArtistNotifications } from '@/contexts/ArtistNotificationContext';
import { toast } from 'sonner';
import { ArtistCampaignHubLayout } from '@/components/campaign-hub/ArtistCampaignHubLayout';

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  artist_id: string;
  payout_type: string;
  payout_rate: number;
  vip_bonus?: number;
  platforms: string[];
  budget?: number;
  end_date?: string;
  created_at: string;
  cover_art_url?: string;
  instructions?: string;
  rules?: string;
  genre?: string;
  status?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface Submission {
  id: string;
  creator_id: string;
  video_url: string;
  platform: string;
  current_views: number;
  current_likes: number;
  initial_views: number;
  initial_likes: number;
  status: string;
  payout_amount: number;
  payout_claimed: boolean;
  created_at: string;
  last_tracked_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

const ArtistCampaignHub = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCampaignNotifications } = useArtistNotifications();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    
    fetchCampaignData();
    
    // Clear notifications for this specific campaign when user visits it
    if (id) {
      clearCampaignNotifications(id);
    }
  }, [id, user, clearCampaignNotifications]);

  const fetchCampaignData = async () => {
    try {
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (campaignError) {
        console.error('Error fetching campaign:', campaignError);
        toast.error('Failed to load campaign details');
        navigate('/artist');
        return;
      }

      // Verify user is the campaign owner
      if (campaignData.artist_id !== user.id) {
        toast.error('You do not have permission to view this campaign');
        navigate('/artist');
        return;
      }

      setCampaign(campaignData);

      // Fetch media assets
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_assets')
        .select('*')
        .eq('campaign_id', id);

      if (!mediaError && mediaData) {
        setMediaAssets(mediaData);
      }

      // Fetch submissions with creator profiles
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', id);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
      } else if (submissionsData && submissionsData.length > 0) {
        // Fetch profiles for participants
        const creatorIds = submissionsData.map(s => s.creator_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url')
          .in('user_id', creatorIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Create a map for easier lookup
        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.user_id, {
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url
          });
        });

        // Combine submissions with their profiles
        const submissionsWithProfiles = submissionsData.map(submission => {
          const profile = profilesMap.get(submission.creator_id);
          return {
            ...submission,
            profiles: profile || {
              username: `user_${submission.creator_id.slice(0, 8)}`,
              display_name: null,
              avatar_url: null
            }
          };
        });

        setSubmissions(submissionsWithProfiles);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error in fetchCampaignData:', error);
      toast.error('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/artist');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The campaign you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button onClick={handleBack} className="text-primary hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ArtistCampaignHubLayout
      campaign={campaign}
      mediaAssets={mediaAssets}
      submissions={submissions}
      onBack={handleBack}
      onSubmissionUpdate={fetchCampaignData}
    />
  );
};

export default ArtistCampaignHub;