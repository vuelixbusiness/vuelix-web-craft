import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  Eye, 
  Heart, 
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

interface Participation {
  id: string;
  video_url: string;
  platform: string;
  initial_views: number;
  current_views: number;
  initial_likes: number;
  current_likes: number;
  last_tracked_at: string;
  status: string;
  payout_claimed: boolean;
  payout_amount: number;
  payout_claimed_at: string;
  campaigns: {
    title: string;
    song_title: string;
    payout_type: string;
    payout_rate: number;
    vip_bonus: number;
    max_payout: number;
    vip_max_payout: number;
  };
}

const ViewTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  const [payoutLoading, setPayoutLoading] = useState<string | null>(null);

  const platformIcons = {
    tiktok: <FaTiktok className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    youtube: <FaYoutube className="w-4 h-4" />
  };

  const platformNames = {
    tiktok: "TikTok",
    instagram: "Instagram", 
    youtube: "YouTube"
  };

  const fetchParticipations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaign_participations')
        .select(`
          *,
          campaigns (
            title,
            song_title,
            payout_type,
            payout_rate,
            vip_bonus,
            max_payout,
            vip_max_payout
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipations(data || []);
    } catch (error) {
      console.error('Error fetching participations:', error);
      toast({
        title: "Error",
        description: "Failed to load your video submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackViews = async (participationId: string) => {
    setTrackingLoading(participationId);

    try {
      const { data, error } = await supabase.functions.invoke('track-video-views', {
        body: { participationId, forceUpdate: true }
      });

      if (error) throw error;

      toast({
        title: "Views Updated",
        description: `Found ${data.stats?.views || 0} views (+${data.viewIncrease || 0} new)`,
      });

      // Refresh the data
      await fetchParticipations();

    } catch (error) {
      console.error('Error tracking views:', error);
      toast({
        title: "Tracking Failed",
        description: "Failed to update view count. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTrackingLoading(null);
    }
  };

  const claimPayout = async (participationId: string) => {
    if (!user) return;
    
    setPayoutLoading(participationId);

    try {
      const { data, error } = await supabase.functions.invoke('process-payout', {
        body: { participationId, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Payout Claimed!",
        description: `You earned $${data.payoutAmount}! ${data.isVip ? '(VIP bonus included)' : ''}`,
      });

      // Refresh the data
      await fetchParticipations();

    } catch (error) {
      console.error('Error claiming payout:', error);
      toast({
        title: "Payout Failed",
        description: error.message || "Failed to process payout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPayoutLoading(null);
    }
  };

  const calculateEstimatedPayout = (participation: Participation): number => {
    if (!participation.campaigns) return 0;
    
    const campaign = participation.campaigns;
    const isVip = user?.membershipType === 'premium';
    
    let amount = 0;
    const views = participation.current_views || 0;
    const likes = participation.current_likes || 0;
    
    switch (campaign.payout_type) {
      case 'per_view':
        amount = views * campaign.payout_rate;
        if (isVip && campaign.vip_bonus) {
          amount += views * campaign.vip_bonus;
        }
        break;
      case 'per_like':
        amount = likes * campaign.payout_rate;
        if (isVip && campaign.vip_bonus) {
          amount += likes * campaign.vip_bonus;
        }
        break;
      case 'flat_rate':
        amount = campaign.payout_rate;
        if (isVip && campaign.vip_bonus) {
          amount += campaign.vip_bonus;
        }
        break;
    }
    
    const maxPayout = isVip && campaign.vip_max_payout 
      ? campaign.vip_max_payout 
      : campaign.max_payout || 999999;
      
    return Math.min(amount, maxPayout);
  };

  useEffect(() => {
    fetchParticipations();

    // Set up real-time updates
    const channel = supabase
      .channel('participation-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaign_participations',
          filter: `creator_id=eq.${user?.id}`
        },
        () => {
          fetchParticipations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading your videos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-secondary/20 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (participations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>View Tracker</span>
          </CardTitle>
          <CardDescription>
            No video submissions yet. Submit a video to start tracking!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {participations.map((participation) => {
        const estimatedPayout = calculateEstimatedPayout(participation);
        const lastTracked = new Date(participation.last_tracked_at);
        const viewIncrease = participation.current_views - participation.initial_views;
        const likeIncrease = participation.current_likes - participation.initial_likes;

        return (
          <Card key={participation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {participation.campaigns?.song_title || 'Campaign Video'}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    {platformIcons[participation.platform as keyof typeof platformIcons]}
                    <span>{platformNames[participation.platform as keyof typeof platformNames]}</span>
                    <Badge 
                      variant={
                        participation.status === 'approved' ? 'default' :
                        participation.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {participation.status}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  {participation.payout_claimed ? (
                    <div className="text-green-600 font-semibold">
                      Claimed: {formatCurrency(participation.payout_amount)}
                    </div>
                  ) : participation.status === 'approved' ? (
                    <div className="text-primary font-semibold">
                      Est: {formatCurrency(estimatedPayout)}
                    </div>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{participation.current_views.toLocaleString()}</span>
                  {viewIncrease > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{viewIncrease.toLocaleString()}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-medium">{participation.current_likes.toLocaleString()}</span>
                  {likeIncrease > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{likeIncrease.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Last updated */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {lastTracked.toLocaleString()}</span>
              </div>

              {/* Payout progress */}
              {participation.status === 'approved' && !participation.payout_claimed && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Earnings</span>
                    <span className="font-medium">{formatCurrency(estimatedPayout)}</span>
                  </div>
                  <Progress value={Math.min((estimatedPayout / (participation.campaigns?.max_payout || 100)) * 100, 100)} />
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {participation.status === 'approved' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => trackViews(participation.id)}
                      disabled={trackingLoading === participation.id}
                    >
                      {trackingLoading === participation.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Update Views
                    </Button>

                    {!participation.payout_claimed && estimatedPayout > 0 && (
                      <Button
                        size="sm"
                        onClick={() => claimPayout(participation.id)}
                        disabled={payoutLoading === participation.id}
                      >
                        {payoutLoading === participation.id ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <DollarSign className="w-4 h-4 mr-2" />
                        )}
                        Claim {formatCurrency(estimatedPayout)}
                      </Button>
                    )}
                  </>
                )}

                {participation.status === 'pending' && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Waiting for approval</span>
                  </div>
                )}

                {participation.payout_claimed && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Payout claimed on {new Date(participation.payout_claimed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ViewTracker;