import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  creator_id: string;
  current_views: number;
  current_likes: number;
  payout_amount: number;
  profiles: {
    username: string;
    display_name?: string;
    avatar_url?: string;
    membership_type: string;
  };
}

interface CampaignLeaderboardProps {
  campaign: {
    id: string;
    title: string;
  };
}

export function CampaignLeaderboard({ campaign }: CampaignLeaderboardProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time listener for campaign participation updates
    const channel = supabase
      .channel('campaign-leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'campaign_participations',
          filter: `campaign_id=eq.${campaign.id}`
        },
        () => {
          // Refetch leaderboard when any participation changes
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaign.id]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch all campaign participants, sorted by earnings then join date
      const { data, error } = await supabase
        .from('campaign_participations')
        .select(`
          id,
          creator_id,
          current_views,
          current_likes,
          payout_amount,
          created_at
        `)
        .eq('campaign_id', campaign.id)
        .in('status', ['joined', 'approved', 'live', 'submitted'])
        .order('payout_amount', { ascending: false })
        .order('created_at', { ascending: true }) // Earlier join date ranks higher for ties
        .limit(50); // Increased limit to show more participants

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const creatorIds = data.map(entry => entry.creator_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, membership_type')
          .in('user_id', creatorIds);

        if (profilesError) throw profilesError;

        const leaderboardWithProfiles = data.map(entry => ({
          ...entry,
          profiles: profiles?.find(profile => profile.user_id === entry.creator_id) || {
            username: 'Unknown',
            display_name: null,
            avatar_url: null,
            membership_type: 'regular'
          }
        }));

        setLeaderboard(leaderboardWithProfiles);
        
        // Find current user's rank in the full leaderboard
        if (user) {
          const userIndex = data.findIndex(entry => entry.creator_id === user.id);
          setUserRank(userIndex !== -1 ? userIndex + 1 : null);
        }
      } else {
        setLeaderboard([]);
        setUserRank(null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Campaign Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Campaign Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No active participants yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Campaign Leaderboard
          {userRank && (
            <Badge variant="outline" className="ml-auto">
              Your Rank: #{userRank}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const position = index + 1;
            const isCurrentUser = user?.id === entry.creator_id;
            
            return (
              <div
                key={entry.id}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(position)}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {entry.profiles.display_name?.charAt(0) || entry.profiles.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {entry.profiles.display_name || entry.profiles.username}
                    </p>
                    {entry.profiles.membership_type === 'vip' && (
                      <Badge variant="secondary" className="text-xs">VIP</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{entry.current_views.toLocaleString()} views</span>
                    <span>{entry.current_likes.toLocaleString()} likes</span>
                    <span>${entry.payout_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}