-- Add new columns to profiles table for enhanced profile features
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS portfolio_links jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS engagement_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS public_visibility boolean DEFAULT true;

-- Create user_followers table for follow system
CREATE TABLE IF NOT EXISTS public.user_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- Create user_partnerships table
CREATE TABLE IF NOT EXISTS public.user_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  partnership_type text NOT NULL DEFAULT 'collaboration' CHECK (partnership_type IN ('collaboration', 'brand', 'verified')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

ALTER TABLE public.user_partnerships ENABLE ROW LEVEL SECURITY;

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create user_skills table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_level text NOT NULL DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Create user_endorsements table
CREATE TABLE IF NOT EXISTS public.user_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endorsed_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(endorser_id, endorsed_id),
  CHECK (endorser_id != endorsed_id)
);

ALTER TABLE public.user_endorsements ENABLE ROW LEVEL SECURITY;

-- Create user_content_showcase table
CREATE TABLE IF NOT EXISTS public.user_content_showcase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('video', 'image', 'audio', 'post', 'campaign')),
  media_url text NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_content_showcase ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_followers
CREATE POLICY "Users can view all followers" ON public.user_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.user_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.user_followers
  FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for user_partnerships
CREATE POLICY "Users can view their partnerships" ON public.user_partnerships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create partnership requests" ON public.user_partnerships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update partnerships they're part of" ON public.user_partnerships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view all achievements" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "System can create achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_skills
CREATE POLICY "Users can view all skills" ON public.user_skills
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own skills" ON public.user_skills
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_endorsements
CREATE POLICY "Users can view all endorsements" ON public.user_endorsements
  FOR SELECT USING (true);

CREATE POLICY "Users can create endorsements" ON public.user_endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can update their own endorsements" ON public.user_endorsements
  FOR UPDATE USING (auth.uid() = endorser_id);

CREATE POLICY "Users can delete their own endorsements" ON public.user_endorsements
  FOR DELETE USING (auth.uid() = endorser_id);

-- RLS Policies for user_content_showcase
CREATE POLICY "Users can view public content showcase" ON public.user_content_showcase
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own content showcase" ON public.user_content_showcase
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_followers_follower ON public.user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_followed ON public.user_followers(followed_id);
CREATE INDEX IF NOT EXISTS idx_user_partnerships_user ON public.user_partnerships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_partnerships_partner ON public.user_partnerships(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_endorsements_endorser ON public.user_endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_user_endorsements_endorsed ON public.user_endorsements(endorsed_id);
CREATE INDEX IF NOT EXISTS idx_user_content_showcase_user ON public.user_content_showcase(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_showcase_featured ON public.user_content_showcase(featured) WHERE featured = true;

-- Create trigger for updating updated_at on partnerships
CREATE OR REPLACE FUNCTION update_partnership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_partnerships_updated_at
  BEFORE UPDATE ON public.user_partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_partnership_updated_at();

-- Create trigger for updating updated_at on endorsements
CREATE TRIGGER update_user_endorsements_updated_at
  BEFORE UPDATE ON public.user_endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updating updated_at on content showcase
CREATE TRIGGER update_user_content_showcase_updated_at
  BEFORE UPDATE ON public.user_content_showcase
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();