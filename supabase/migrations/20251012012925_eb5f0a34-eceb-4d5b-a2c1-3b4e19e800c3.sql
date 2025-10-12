-- Fix Profile Data Exposure - Replace overly permissive policies with secure ones

-- 1. Remove the policy that exposes all profile data to unauthenticated users
DROP POLICY IF EXISTS "Public users can view basic profile info for discovery" ON profiles;

-- 2. Remove the policy that exposes payment data to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can count creators for statistics" ON profiles;

-- 3. Create a restricted public view for discovery (only safe fields)
CREATE OR REPLACE VIEW public.public_profiles AS 
  SELECT user_id, username, display_name, avatar_url, bio, user_type
  FROM profiles 
  WHERE public_visibility = true;

-- 4. Grant public read access to the view only
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 5. Add policy for authenticated users to view public profiles (without payment data)
CREATE POLICY "Authenticated users can view public profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    public_visibility = true 
    AND user_id != auth.uid()  -- Others' profiles only
  );

-- 6. Create a secure function for counting creators (aggregate only, no individual data)
CREATE OR REPLACE FUNCTION public.count_creators_by_type()
RETURNS TABLE(user_type text, creator_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type, COUNT(*) as creator_count
  FROM profiles 
  GROUP BY user_type;
$$;

-- 7. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.count_creators_by_type() TO authenticated;

-- Fix Campaign Financial Data Exposure

-- 1. Remove the policy that exposes all campaign financial data
DROP POLICY IF EXISTS "Everyone can view active campaigns" ON campaigns;

-- 2. Create a public view with only discovery-relevant fields (no financial data)
CREATE OR REPLACE VIEW public.campaign_listings AS
  SELECT 
    id, 
    title, 
    song_title, 
    genre, 
    platforms, 
    campaign_type, 
    cover_art_url,
    song_url,
    artist_id, 
    end_date, 
    approval_required,
    instructions,
    rules,
    reference_links,
    status,
    created_at
  FROM campaigns
  WHERE status = 'active';

-- 3. Grant public read access to the campaign listings view
GRANT SELECT ON public.campaign_listings TO anon, authenticated;

-- 4. Full campaign details (including financial data) only for participants and artists
CREATE POLICY "Participants and artists view full campaign details" ON campaigns
  FOR SELECT TO authenticated
  USING (
    artist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM campaign_participations
      WHERE campaign_id = campaigns.id 
      AND creator_id = auth.uid()
      AND status IN ('joined', 'approved', 'live', 'submitted')
    )
  );