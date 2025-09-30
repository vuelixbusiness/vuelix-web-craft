import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
  metadata: any;
}

interface ProfileAchievementsProps {
  userId: string;
  featured?: boolean;
}

export function ProfileAchievements({ userId, featured = false }: ProfileAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [userId, featured]);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (featured) {
        query = query.limit(3);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'campaign': return Trophy;
      case 'engagement': return Star;
      case 'milestone': return Award;
      default: return Zap;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No achievements yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {featured ? 'Featured Achievements' : 'Achievements'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = getBadgeIcon(achievement.badge_type);
            return (
              <div
                key={achievement.id}
                className="p-4 border border-border rounded-lg hover:shadow-soft transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{achievement.badge_name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.badge_description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </Badge>
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
