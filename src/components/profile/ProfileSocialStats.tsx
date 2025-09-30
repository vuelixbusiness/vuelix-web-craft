import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSocialStatsProps {
  userId: string;
}

export function ProfileSocialStats({ userId }: ProfileSocialStatsProps) {
  const [stats, setStats] = useState({
    followers: 0,
    friends: 0,
    partners: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      // Get follower count
      const { count: followerCount } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', userId);

      // Get friends count (accepted friendships)
      const { count: friendCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Get partners count
      const { count: partnerCount } = await supabase
        .from('user_partnerships')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
        .eq('status', 'accepted');

      setStats({
        followers: followerCount || 0,
        friends: friendCount || 0,
        partners: partnerCount || 0,
      });
    } catch (error) {
      console.error('Error fetching social stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
      <Card className="hover:shadow-lg transition-smooth">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Followers</p>
              <p className="text-3xl font-bold">{stats.followers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-smooth">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Friends</p>
              <p className="text-3xl font-bold">{stats.friends}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-smooth">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Partners</p>
              <p className="text-3xl font-bold">{stats.partners}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Handshake className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
