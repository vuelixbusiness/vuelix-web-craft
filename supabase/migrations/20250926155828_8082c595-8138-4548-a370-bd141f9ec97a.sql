-- Update the is_campaign_participant function to check for approved submissions
CREATE OR REPLACE FUNCTION public.is_campaign_participant(_user_id uuid, _campaign_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    -- Check if user is an approved participant in the campaign
    SELECT 1 
    FROM public.campaign_participations cp
    WHERE cp.creator_id = _user_id 
      AND cp.campaign_id = _campaign_id
      AND cp.status IN ('approved', 'live', 'submitted')  -- Allow approved, live, and submitted statuses
  ) OR EXISTS (
    -- Check if user is the artist of the campaign
    SELECT 1
    FROM public.campaigns c
    WHERE c.artist_id = _user_id
      AND c.id = _campaign_id
  );
$$;