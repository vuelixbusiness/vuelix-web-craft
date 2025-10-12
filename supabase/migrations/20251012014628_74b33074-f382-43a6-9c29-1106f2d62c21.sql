-- Fix Critical Infinite Recursion in RLS Policies
-- The circular dependency between campaigns and campaign_participations policies
-- causes infinite recursion. We need security definer functions to break the cycle.

-- 1. Create function to check if user is campaign artist (breaks recursion)
CREATE OR REPLACE FUNCTION public.is_campaign_artist(_user_id uuid, _campaign_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = _campaign_id 
    AND artist_id = _user_id
  );
$$;

-- 2. Fix the circular RLS policies using the new function
-- Drop problematic policies
DROP POLICY IF EXISTS "Artists can view participations for their campaigns" ON campaign_participations;
DROP POLICY IF EXISTS "Artists can update participations for their campaigns" ON campaign_participations;

-- Recreate with security definer function (no recursion)
CREATE POLICY "Artists can view participations for their campaigns" 
ON campaign_participations
FOR SELECT TO public
USING (public.is_campaign_artist(auth.uid(), campaign_id));

CREATE POLICY "Artists can update participations for their campaigns" 
ON campaign_participations
FOR UPDATE TO public
USING (public.is_campaign_artist(auth.uid(), campaign_id));

-- 3. Harden sync_campaign_chat_members to validate caller is campaign artist
CREATE OR REPLACE FUNCTION public.sync_campaign_chat_members(
  _campaign_id uuid, 
  _room_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate: Only campaign artist can sync chat members
  IF NOT public.is_campaign_artist(auth.uid(), _campaign_id) THEN
    RAISE EXCEPTION 'Only campaign artist can sync chat members';
  END IF;
  
  -- Add all campaign participants to the group chat room
  INSERT INTO public.chat_room_members (room_id, user_id)
  SELECT _room_id, cp.creator_id
  FROM public.campaign_participations cp
  WHERE cp.campaign_id = _campaign_id
  ON CONFLICT (room_id, user_id) DO NOTHING;
  
  -- Add the artist to the group chat room
  INSERT INTO public.chat_room_members (room_id, user_id)
  SELECT _room_id, c.artist_id
  FROM public.campaigns c
  WHERE c.id = _campaign_id
  ON CONFLICT (room_id, user_id) DO NOTHING;
END;
$$;

-- 4. Remove debug function from production (security risk)
DROP FUNCTION IF EXISTS public.debug_campaign_chat_access(uuid, text, text);