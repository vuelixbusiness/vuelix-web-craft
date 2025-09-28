import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Music, Users, Eye, Heart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ParticipantsList from '@/components/campaign-details/ParticipantsList';
import SubmissionsLog from '@/components/campaign-details/SubmissionsLog';

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  genre: string;
  platforms: string[];
  budget: number;
  status: string;
  created_at: string;
  end_date: string | null;
  instructions: string | null;
  song_url: string | null;
  cover_art_url: string | null;
  payout_type: string;
  payout_rate: number;
  max_payout: number | null;
  vip_max_payout: number | null;
  campaign_type: string;
  artist_id: string;
}

interface Participant {
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

interface UniqueParticipant {
  creator_id: string;
  join_date: string;
  submission_count: number;
  platforms: string[];
  primary_platform: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [uniqueParticipants, setUniqueParticipants] = useState<UniqueParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    
    fetchCampaignDetails();
  }, [id, user]);

  const fetchCampaignDetails = async () => {
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
        navigate('/campaigns');
        return;
      }

      setCampaign(campaignData);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return;
      }

      if (participantsData && participantsData.length > 0) {
        // Fetch profiles for participants
        const creatorIds = participantsData.map(p => p.creator_id);
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

        // Combine participants with their profiles, providing fallbacks
        const participantsWithProfiles = participantsData.map(participant => {
          const profile = profilesMap.get(participant.creator_id);
          return {
            ...participant,
            profiles: profile || {
              username: `user_${participant.creator_id.slice(0, 8)}`,
              display_name: null,
              avatar_url: null
            }
          };
        });
        
        // Log any missing profile data for debugging
        const missingProfiles = participantsWithProfiles.filter(p => 
          p.profiles.username.startsWith('user_')
        );
        if (missingProfiles.length > 0) {
          console.warn('Participants with missing profiles:', missingProfiles.map(p => p.creator_id));
        }

        setParticipants(participantsWithProfiles);

        // Create unique participants by grouping by creator_id
        const uniqueParticipantsMap = new Map<string, UniqueParticipant>();
        
        participantsWithProfiles.forEach(participant => {
          const existing = uniqueParticipantsMap.get(participant.creator_id);
          
          if (!existing) {
            // First submission from this creator
            uniqueParticipantsMap.set(participant.creator_id, {
              creator_id: participant.creator_id,
              join_date: participant.created_at,
              submission_count: 1,
              platforms: [participant.platform],
              primary_platform: participant.platform,
              profiles: participant.profiles
            });
          } else {
            // Update existing participant data
            existing.submission_count++;
            if (!existing.platforms.includes(participant.platform)) {
              existing.platforms.push(participant.platform);
            }
            // Use most recent submission data
            if (new Date(participant.created_at) > new Date(existing.join_date)) {
              existing.primary_platform = participant.platform;
            }
            // Use earliest join date
            if (new Date(participant.created_at) < new Date(existing.join_date)) {
              existing.join_date = participant.created_at;
            }
          }
        });

        setUniqueParticipants(Array.from(uniqueParticipantsMap.values()));
      } else {
        setParticipants([]);
        setUniqueParticipants([]);
      }
    } catch (error) {
      console.error('Error in fetchCampaignDetails:', error);
      toast.error('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalViews = participants.reduce((sum, p) => sum + (p.current_views || 0), 0);
  const totalLikes = participants.reduce((sum, p) => sum + (p.current_likes || 0), 0);
  const totalPayout = participants.reduce((sum, p) => sum + (p.payout_amount || 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The campaign you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <p className="text-muted-foreground">{campaign.song_title}</p>
          </div>
          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
            {campaign.status}
          </Badge>
        </div>

        {/* Campaign Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(campaign.budget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold">{uniqueParticipants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Information */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Genre</label>
                  <p className="font-medium">{campaign.genre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Campaign Type</label>
                  <p className="font-medium">{campaign.campaign_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payout Type</label>
                  <p className="font-medium">{campaign.payout_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payout Rate</label>
                  <p className="font-medium">{formatCurrency(campaign.payout_rate)} per 1,000 Views</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Platforms</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.platforms.map((platform) => (
                    <Badge key={platform} variant="outline">{platform}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="font-medium">{formatDate(campaign.created_at)}</p>
                </div>

                {campaign.end_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <p className="font-medium">{formatDate(campaign.end_date)}</p>
                  </div>
                )}
              </div>

              {campaign.instructions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                  <p className="text-sm bg-muted p-3 rounded-md">{campaign.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Two Distinct Boxes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Participants Box */}
            <ParticipantsList participants={uniqueParticipants} />
            
            {/* Complete Submissions Log Box */}
          <SubmissionsLog 
            submissions={participants} 
            campaignId={id!}
            isArtist={campaign?.artist_id === user?.id}
            onSubmissionUpdate={fetchCampaignDetails}
          />
          </div>

          {/* Media Assets */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Media Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.cover_art_url && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cover Art</label>
                    <img 
                      src={campaign.cover_art_url} 
                      alt="Campaign cover art"
                      className="w-full rounded-lg mt-2"
                    />
                  </div>
                )}

                {campaign.song_url && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Song</label>
                    <audio controls className="w-full mt-2">
                      <source src={campaign.song_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {!campaign.cover_art_url && !campaign.song_url && (
                  <p className="text-muted-foreground text-center py-4">No media assets uploaded</p>
                )}
              </CardContent>
            </Card>

            {/* Campaign Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Payout</span>
                  <span className="font-medium">{formatCurrency(totalPayout)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Budget</span>
                  <span className="font-medium">{formatCurrency(campaign.budget - totalPayout)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Views per Creator</span>
                  <span className="font-medium">
                    {uniqueParticipants.length > 0 ? Math.round(totalViews / uniqueParticipants.length).toLocaleString() : 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetails;