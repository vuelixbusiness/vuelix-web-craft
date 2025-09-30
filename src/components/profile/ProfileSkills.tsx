import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Skill {
  id: string;
  skill_name: string;
  skill_level: string;
  verified_by: string | null;
}

interface ProfileSkillsProps {
  userId: string;
}

export function ProfileSkills({ userId }: ProfileSkillsProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, [userId]);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('skill_level', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'default';
      case 'advanced': return 'default';
      case 'intermediate': return 'secondary';
      case 'beginner': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No skills added yet
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge
          key={skill.id}
          variant={getLevelColor(skill.skill_level)}
          className="text-sm px-3 py-1.5 flex items-center gap-2"
        >
          {skill.skill_name}
          <span className="text-xs opacity-70 capitalize">({skill.skill_level})</span>
          {skill.verified_by && (
            <CheckCircle2 className="w-3 h-3 text-primary" />
          )}
        </Badge>
      ))}
    </div>
  );
}
