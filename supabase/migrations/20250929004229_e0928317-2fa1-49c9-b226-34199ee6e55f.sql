-- Fix infinite recursion issue in campaign participations RLS
-- Step 1: Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Campaign participants can view other participants in same campaign" ON public.campaign_participations;

-- Step 2: Update the is_campaign_participant function to include 'joined' status
CREATE OR REPLACE FUNCTION public.is_campaign_participant(_user_id uuid, _campaign_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    -- Check if user is an approved participant in the campaign
    SELECT 1 
    FROM public.campaign_participations cp
    WHERE cp.creator_id = _user_id 
      AND cp.campaign_id = _campaign_id
      AND cp.status IN ('joined', 'approved', 'live', 'submitted')  -- Include 'joined' status
  ) OR EXISTS (
    -- Check if user is the artist of the campaign
    SELECT 1
    FROM public.campaigns c
    WHERE c.artist_id = _user_id
      AND c.id = _campaign_id
  );
$$;

-- Step 3: Create a safe RLS policy using the security definer function
CREATE POLICY "Campaign participants can view leaderboard" 
ON public.campaign_participations 
FOR SELECT 
USING (public.is_campaign_participant(auth.uid(), campaign_id));