-- Fix infinite recursion in chat_room_members RLS policies
-- First drop the problematic policy
DROP POLICY IF EXISTS "Users can view chat room members for rooms they're in" ON public.chat_room_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.check_user_chat_room_membership(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_room_members
    WHERE user_id = _user_id AND room_id = _room_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_chat_rooms(_user_id uuid)
RETURNS TABLE(room_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT crm.room_id
  FROM public.chat_room_members crm
  WHERE crm.user_id = _user_id
$$;

-- Create new non-recursive RLS policies using security definer functions
CREATE POLICY "Users can view chat room members for rooms they're in - fixed"
ON public.chat_room_members
FOR SELECT
USING (room_id IN (SELECT public.get_user_chat_rooms(auth.uid())));

-- Update chat_rooms policy to use security definer function
DROP POLICY IF EXISTS "Users can view chat rooms they're members of" ON public.chat_rooms;
CREATE POLICY "Users can view chat rooms they're members of - fixed"
ON public.chat_rooms
FOR SELECT
USING (id IN (SELECT public.get_user_chat_rooms(auth.uid())));

-- Update messages policy to use security definer function  
DROP POLICY IF EXISTS "Users can view messages in rooms they're members of" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to rooms they're members of" ON public.messages;

CREATE POLICY "Users can view messages in rooms they're members of - fixed"
ON public.messages
FOR SELECT
USING (room_id IN (SELECT public.get_user_chat_rooms(auth.uid())));

CREATE POLICY "Users can send messages to rooms they're members of - fixed"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND 
  room_id IN (SELECT public.get_user_chat_rooms(auth.uid()))
);

-- Create function to auto-add campaign participants to group chat
CREATE OR REPLACE FUNCTION public.sync_campaign_chat_members(_campaign_id uuid, _room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Add unique constraint to prevent duplicate memberships (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_room_members_room_user_unique'
    AND table_name = 'chat_room_members'
  ) THEN
    ALTER TABLE public.chat_room_members 
    ADD CONSTRAINT chat_room_members_room_user_unique 
    UNIQUE (room_id, user_id);
  END IF;
END $$;