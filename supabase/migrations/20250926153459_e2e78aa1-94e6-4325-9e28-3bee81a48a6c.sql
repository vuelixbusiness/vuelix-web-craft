-- Fix the RLS policy with better campaign ID extraction and debugging
DROP POLICY IF EXISTS "Users can create campaign chat rooms" ON public.chat_rooms;

-- Create improved RLS policy with better debugging
CREATE POLICY "Users can create campaign chat rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND (
    -- Allow creation of general chat rooms (not campaign-related)
    room_type NOT LIKE 'campaign_%' OR
    -- Allow creation of campaign-related rooms if user is participant or artist
    (room_type LIKE 'campaign_%' AND 
     name LIKE 'campaign_%' AND
     CASE 
       -- For campaign group rooms: campaign_{uuid}_group
       WHEN room_type = 'campaign_group' AND name ~ '^campaign_[a-f0-9-]{36}_group$' THEN
         public.is_campaign_participant(
           auth.uid(), 
           CAST(substring(name from 'campaign_([a-f0-9-]{36})_group') AS uuid)
         )
       -- For campaign DM rooms: campaign_{uuid}_dm_{uuid}_{uuid}
       WHEN room_type = 'campaign_dm' AND name ~ '^campaign_[a-f0-9-]{36}_dm_[a-f0-9-]{36}_[a-f0-9-]{36}$' THEN
         public.is_campaign_participant(
           auth.uid(), 
           CAST(substring(name from 'campaign_([a-f0-9-]{36})_dm_') AS uuid)
         )
       -- Fallback for any other campaign room format
       ELSE 
         public.is_campaign_participant(
           auth.uid(), 
           CAST(SPLIT_PART(SPLIT_PART(name, 'campaign_', 2), '_', 1) AS uuid)
         )
     END)
  )
);

-- Add function to help debug RLS issues
CREATE OR REPLACE FUNCTION public.debug_campaign_chat_access(_user_id uuid, _room_name text, _room_type text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  extracted_campaign_id uuid;
  is_participant boolean := false;
BEGIN
  -- Extract campaign ID based on room type
  IF _room_type = 'campaign_group' AND _room_name ~ '^campaign_[a-f0-9-]{36}_group$' THEN
    extracted_campaign_id := CAST(substring(_room_name from 'campaign_([a-f0-9-]{36})_group') AS uuid);
  ELSIF _room_type = 'campaign_dm' AND _room_name ~ '^campaign_[a-f0-9-]{36}_dm_[a-f0-9-]{36}_[a-f0-9-]{36}$' THEN
    extracted_campaign_id := CAST(substring(_room_name from 'campaign_([a-f0-9-]{36})_dm_') AS uuid);
  ELSE
    -- Fallback method
    BEGIN
      extracted_campaign_id := CAST(SPLIT_PART(SPLIT_PART(_room_name, 'campaign_', 2), '_', 1) AS uuid);
    EXCEPTION WHEN OTHERS THEN
      extracted_campaign_id := NULL;
    END;
  END IF;
  
  -- Check if user is participant
  IF extracted_campaign_id IS NOT NULL THEN
    is_participant := public.is_campaign_participant(_user_id, extracted_campaign_id);
  END IF;
  
  result := jsonb_build_object(
    'user_id', _user_id,
    'room_name', _room_name,
    'room_type', _room_type,
    'extracted_campaign_id', extracted_campaign_id,
    'is_participant', is_participant
  );
  
  RETURN result;
END;
$$;