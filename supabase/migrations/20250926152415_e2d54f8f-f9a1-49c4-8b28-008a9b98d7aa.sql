-- Create security definer function to check if user is campaign participant
CREATE OR REPLACE FUNCTION public.is_campaign_participant(_user_id uuid, _campaign_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if user is a participant in the campaign
    SELECT 1 
    FROM public.campaign_participations cp
    WHERE cp.creator_id = _user_id 
      AND cp.campaign_id = _campaign_id
  ) OR EXISTS (
    -- Check if user is the artist of the campaign
    SELECT 1
    FROM public.campaigns c
    WHERE c.artist_id = _user_id
      AND c.id = _campaign_id
  );
$$;

-- Update the chat_rooms INSERT policy to allow campaign participants and artists
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;

CREATE POLICY "Users can create campaign chat rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND (
    -- Allow creation of general chat rooms
    room_type NOT LIKE 'campaign_%' OR
    -- Allow creation of campaign-related rooms if user is participant or artist
    (room_type LIKE 'campaign_%' AND 
     public.is_campaign_participant(
       auth.uid(), 
       CAST(SPLIT_PART(SPLIT_PART(name, 'campaign_', 2), '_', 1) AS uuid)
     ))
  )
);