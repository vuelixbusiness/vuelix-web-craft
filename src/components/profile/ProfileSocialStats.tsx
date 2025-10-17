import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Handshake, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileConnectionsDialog } from "./ProfileConnectionsDialog";

interface ProfileSocialStatsProps {
  userId: string;
}

export function ProfileSocialStats({ userId }: ProfileSocialStatsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'followers' | 'partners' | 'following'>('followers');
  const [stats, setStats] = useState({
    followers: 0,
    partners: 0,
    following: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const handleCardClick = (type: 'followers' | 'partners' | 'following') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const fetchStats = async () => {
    try {
      // Get follower count
      const { count: followerCount } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', userId);

      // Get partners count
      const { count: partnerCount } = await supabase
        .from('user_partnerships')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Get following count (users that this user follows)
      const { count: followingCount } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setStats({
        followers: followerCount || 0,
        partners: partnerCount || 0,
        following: followingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching social stats:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => handleCardClick('followers')}
        >
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

        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => handleCardClick('partners')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Partners</p>
                <p className="text-3xl font-bold">{stats.partners}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Handshake className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => handleCardClick('following')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Following</p>
                <p className="text-3xl font-bold">{stats.following}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfileConnectionsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userId={userId}
        type={dialogType}
      />
    </>
  );
}
