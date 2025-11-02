import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Music, Copy, Check, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

interface Campaign {
  id: string;
  owner_id: string | null;
  artist_id: string;
  title: string;
  description: string | null;
  track_url: string | null;
  cover_url: string | null;
  song_url: string | null;
  cover_art_url: string | null;
  bounty_cents: number;
  budget_cents: number;
  status: string;
  start_at: string | null;
  end_at: string | null;
  end_date: string | null;
  created_at: string;
}

export default function CampaignDetailRestored() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchParticipantCount();
      if (user) {
        checkIfJoined();
      }
    }
  }, [id, user]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCampaign(data as any);
    } catch (error: any) {
      toast({
        title: 'Error loading campaign',
        description: error.message,
        variant: 'destructive'
      });
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantCount = async () => {
    try {
      const { count, error } = await supabase
        .from('campaign_participants')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id);

      if (error) throw error;
      setParticipantCount(count || 0);
    } catch (error) {
      console.error('Error fetching participant count:', error);
    }
  };

  const checkIfJoined = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('id')
        .eq('campaign_id', id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setHasJoined(!!data);
    } catch (error) {
      console.error('Error checking participation:', error);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: id!,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already joined',
            description: 'You have already joined this campaign'
          });
          setHasJoined(true);
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Success!',
          description: 'You have joined the campaign'
        });
        setHasJoined(true);
        fetchParticipantCount();
      }
    } catch (error: any) {
      toast({
        title: 'Error joining campaign',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setJoining(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: 'Link copied',
      description: 'Campaign link copied to clipboard'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
          <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate('/campaigns')} className="mb-6">
          ← Back to Campaigns
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {(campaign.cover_url || campaign.cover_art_url) && (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <img
                  src={campaign.cover_url || campaign.cover_art_url || ''}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={campaign.status === 'live' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{campaign.title}</h1>
              <p className="text-muted-foreground whitespace-pre-wrap">{campaign.description || 'No description provided.'}</p>
            </div>

            {(campaign.track_url || campaign.song_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Track
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <a href={campaign.track_url || campaign.song_url || '#'} target="_blank" rel="noopener noreferrer">
                      Listen to Track
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Bounty</div>
                  <div className="text-2xl font-bold text-primary">
                    ${(campaign.bounty_cents / 100).toFixed(2)}
                  </div>
                </div>
                {campaign.budget_cents > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
                    <div className="text-xl font-semibold">
                      ${(campaign.budget_cents / 100).toFixed(2)}
                    </div>
                  </div>
                )}
                {campaign.start_at && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Start Date</div>
                    <div className="font-medium">
                      {format(new Date(campaign.start_at), 'MMMM d, yyyy')}
                    </div>
                  </div>
                )}
                {(campaign.end_at || campaign.end_date) && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">End Date</div>
                    <div className="font-medium">
                      {format(new Date(campaign.end_at || campaign.end_date!), 'MMMM d, yyyy')}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants
                  </div>
                  <div className="text-xl font-semibold">{participantCount}</div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {user && (campaign.owner_id === user.id || campaign.artist_id === user.id) ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}
                >
                  Edit Campaign
                </Button>
              ) : hasJoined ? (
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    Joined
                  </Button>
                  {user && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      View Your Profile
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleJoin}
                  disabled={joining || campaign.status !== 'live'}
                >
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Campaign'
                  )}
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={copyShareLink}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Share Campaign
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
