import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Heart, 
  RefreshCw,
  Wallet,
  Clock,
  Target
} from "lucide-react";

interface Campaign {
  id: string;
  payout_type: string;
  payout_rate: number;
  vip_bonus?: number;
  max_payout?: number;
  vip_max_payout?: number;
}

interface Participation {
  id: string;
  current_views: number;
  current_likes: number;
  payout_claimed: boolean;
  payout_amount: number;
  status: string;
  last_tracked_at: string;
}

interface EarningsTrackerProps {
  campaign: Campaign;
}

export default function EarningsTracker({ campaign }: EarningsTrackerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchParticipations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('creator_id', user.id)
        .eq('status', 'approved')
        .or('status.eq.live');

      if (error) throw error;
      setParticipations(data || []);
    } catch (error) {
      console.error('Error fetching participations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();

    // Set up real-time updates
    const channel = supabase
      .channel('earnings-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaign_participations',
          filter: `campaign_id=eq.${campaign.id}`
        },
        () => {
          fetchParticipations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaign.id, user?.id]);

  const calculateTotalEarnings = (): { estimated: number; claimed: number; pending: number } => {
    const isVip = user?.membershipType === 'premium';
    
    let estimated = 0;
    let claimed = 0;
    let pending = 0;

    participations.forEach(participation => {
      if (participation.payout_claimed) {
        claimed += participation.payout_amount;
      } else {
        const views = participation.current_views || 0;
        const likes = participation.current_likes || 0;
        
        let amount = 0;
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
          
        amount = Math.min(amount, maxPayout);
        pending += amount;
        estimated += amount;
      }
    });

    return { estimated: estimated + claimed, claimed, pending };
  };

  const getTotalMetrics = () => {
    return participations.reduce(
      (acc, p) => ({
        views: acc.views + (p.current_views || 0),
        likes: acc.likes + (p.current_likes || 0)
      }),
      { views: 0, likes: 0 }
    );
  };

  const updateAllViews = async () => {
    setIsUpdating(true);

    try {
      const promises = participations.map(p => 
        supabase.functions.invoke('track-video-views', {
          body: { participationId: p.id, forceUpdate: true }
        })
      );

      await Promise.all(promises);
      
      toast({
        title: "Views Updated",
        description: "All submissions have been updated with latest view counts",
      });

      await fetchParticipations();
    } catch (error) {
      console.error('Error updating views:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update view counts",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const claimAllEarnings = async () => {
    setIsClaiming(true);

    try {
      const unclaimedParticipations = participations.filter(p => !p.payout_claimed);
      
      const promises = unclaimedParticipations.map(p => 
        supabase.functions.invoke('process-payout', {
          body: { participationId: p.id, userId: user?.id }
        })
      );

      const results = await Promise.all(promises);
      const totalClaimed = results.reduce((sum, result) => sum + (result.data?.payoutAmount || 0), 0);
      
      toast({
        title: "Earnings Claimed!",
        description: `Successfully claimed $${totalClaimed.toFixed(2)} from this campaign`,
      });

      await fetchParticipations();
    } catch (error) {
      console.error('Error claiming earnings:', error);
      toast({
        title: "Claim Failed", 
        description: "Failed to claim earnings",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Earnings Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary/20 rounded"></div>
            <div className="h-4 bg-secondary/20 rounded"></div>
            <div className="h-4 bg-secondary/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (participations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Earnings Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No approved submissions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Submit content and get approved to start earning
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { estimated, claimed, pending } = calculateTotalEarnings();
  const { views, likes } = getTotalMetrics();
  const lastUpdated = participations.length > 0 
    ? new Date(Math.max(...participations.map(p => new Date(p.last_tracked_at).getTime())))
    : new Date();

  const maxPossibleEarning = campaign.max_payout || 1000;
  const progressPercentage = (estimated / maxPossibleEarning) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Campaign Earnings
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {participations.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Earnings Display */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-green-600">
            ${estimated.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Total Estimated Earnings</p>
          
          {campaign.max_payout && (
            <div className="space-y-1">
              <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                ${estimated.toFixed(2)} / ${campaign.max_payout.toFixed(2)} max
              </p>
            </div>
          )}
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <Wallet className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="font-semibold text-green-700">${claimed.toFixed(2)}</div>
            <div className="text-xs text-green-600">Claimed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="font-semibold text-blue-700">${pending.toFixed(2)}</div>
            <div className="text-xs text-blue-600">Pending</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance Summary
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>Total Views</span>
              </div>
              <span className="font-medium">{views.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Total Likes</span>
              </div>
              <span className="font-medium">{likes.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={updateAllViews}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update All Views
              </>
            )}
          </Button>

          {pending > 0 && (
            <Button
              className="w-full"
              onClick={claimAllEarnings}
              disabled={isClaiming}
            >
              {isClaiming ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Claiming...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Claim ${pending.toFixed(2)}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}