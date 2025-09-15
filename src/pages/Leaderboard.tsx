import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, DollarSign, Eye, Crown, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  total_earnings: number;
  total_views: number;
}

const Leaderboard = () => {
  const [earningsLeaderboard, setEarningsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [viewsLeaderboard, setViewsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyEarningsLeaderboard, setWeeklyEarningsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyViewsLeaderboard, setWeeklyViewsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      
      // Get all-time earnings leaderboard
      const { data: allTimeEarnings } = await supabase
        .from('campaign_participations')
        .select(`
          creator_id,
          payout_amount,
          current_views,
          profiles:creator_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .not('payout_amount', 'is', null);

      // Get weekly earnings leaderboard (past 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyEarnings } = await supabase
        .from('campaign_participations')
        .select(`
          creator_id,
          payout_amount,
          current_views,
          profiles:creator_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .gte('updated_at', weekAgo.toISOString())
        .not('payout_amount', 'is', null);

      // Process all-time data
      if (allTimeEarnings) {
        const earningsMap = new Map<string, LeaderboardEntry>();
        const viewsMap = new Map<string, LeaderboardEntry>();

        allTimeEarnings.forEach(participation => {
          const userId = participation.creator_id;
          const profile = participation.profiles as any;
          
          if (!earningsMap.has(userId)) {
            earningsMap.set(userId, {
              user_id: userId,
              display_name: profile?.display_name || 'Anonymous',
              username: profile?.username || 'user',
              avatar_url: profile?.avatar_url,
              total_earnings: 0,
              total_views: 0
            });
          }
          
          if (!viewsMap.has(userId)) {
            viewsMap.set(userId, {
              user_id: userId,
              display_name: profile?.display_name || 'Anonymous', 
              username: profile?.username || 'user',
              avatar_url: profile?.avatar_url,
              total_earnings: 0,
              total_views: 0
            });
          }

          const earningsEntry = earningsMap.get(userId)!;
          const viewsEntry = viewsMap.get(userId)!;
          
          earningsEntry.total_earnings += Number(participation.payout_amount || 0);
          viewsEntry.total_views += participation.current_views || 0;
        });

        setEarningsLeaderboard(Array.from(earningsMap.values())
          .sort((a, b) => b.total_earnings - a.total_earnings)
          .slice(0, 50));
          
        setViewsLeaderboard(Array.from(viewsMap.values())
          .sort((a, b) => b.total_views - a.total_views)
          .slice(0, 50));
      }

      // Process weekly data
      if (weeklyEarnings) {
        const weeklyEarningsMap = new Map<string, LeaderboardEntry>();
        const weeklyViewsMap = new Map<string, LeaderboardEntry>();

        weeklyEarnings.forEach(participation => {
          const userId = participation.creator_id;
          const profile = participation.profiles as any;
          
          if (!weeklyEarningsMap.has(userId)) {
            weeklyEarningsMap.set(userId, {
              user_id: userId,
              display_name: profile?.display_name || 'Anonymous',
              username: profile?.username || 'user',
              avatar_url: profile?.avatar_url,
              total_earnings: 0,
              total_views: 0
            });
          }
          
          if (!weeklyViewsMap.has(userId)) {
            weeklyViewsMap.set(userId, {
              user_id: userId,
              display_name: profile?.display_name || 'Anonymous',
              username: profile?.username || 'user', 
              avatar_url: profile?.avatar_url,
              total_earnings: 0,
              total_views: 0
            });
          }

          const earningsEntry = weeklyEarningsMap.get(userId)!;
          const viewsEntry = weeklyViewsMap.get(userId)!;
          
          earningsEntry.total_earnings += Number(participation.payout_amount || 0);
          viewsEntry.total_views += participation.current_views || 0;
        });

        setWeeklyEarningsLeaderboard(Array.from(weeklyEarningsMap.values())
          .sort((a, b) => b.total_earnings - a.total_earnings)
          .slice(0, 50));
          
        setWeeklyViewsLeaderboard(Array.from(weeklyViewsMap.values())
          .sort((a, b) => b.total_views - a.total_views)
          .slice(0, 50));
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toLocaleString();
  };

  const LeaderboardList = ({ data, type }: { data: LeaderboardEntry[], type: 'earnings' | 'views' }) => (
    <div className="space-y-4">
      {data.map((entry, index) => (
        <div key={entry.user_id} className="flex items-center gap-4 p-4 bg-card rounded-lg border">
          <div className="flex-shrink-0">
            {getRankIcon(index + 1)}
          </div>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={entry.avatar_url} alt={entry.display_name} />
            <AvatarFallback>{entry.display_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{entry.display_name}</p>
            <p className="text-sm text-muted-foreground">@{entry.username}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {type === 'earnings' ? (
              <>
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-bold text-green-500">{formatCurrency(entry.total_earnings)}</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-blue-500">{formatViews(entry.total_views)}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            See who's leading the pack in earnings and views
          </p>
        </div>

        <Tabs defaultValue="all-time" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="all-time">All Time</TabsTrigger>
            <TabsTrigger value="weekly">Past Week</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-time">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Top Earners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <LeaderboardList data={earningsLeaderboard} type="earnings" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Most Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <LeaderboardList data={viewsLeaderboard} type="views" />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="weekly">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Top Earners (Past Week)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <LeaderboardList data={weeklyEarningsLeaderboard} type="earnings" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Most Views (Past Week)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <LeaderboardList data={weeklyViewsLeaderboard} type="views" />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;