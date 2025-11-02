-- Fix campaigns RLS policies to work with artist_id referencing profiles.id

-- Drop old policies that incorrectly compare auth.uid() with artist_id
DROP POLICY IF EXISTS "Artists can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Artists can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Artists can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Artists can delete their own terminated campaigns" ON public.campaigns;

-- Create helper function to check if user owns a profile
CREATE OR REPLACE FUNCTION public.is_user_profile(_profile_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id AND user_id = _user_id
  )
$$;

-- Recreate policies with correct logic
CREATE POLICY "Artists can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (
  public.is_user_profile(artist_id, auth.uid())
);

CREATE POLICY "Artists can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (
  public.is_user_profile(artist_id, auth.uid())
);

CREATE POLICY "Artists can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (
  public.is_user_profile(artist_id, auth.uid())
);

CREATE POLICY "Artists can delete their own terminated campaigns" 
ON public.campaigns 
FOR DELETE 
USING (
  public.is_user_profile(artist_id, auth.uid()) AND status = 'terminated'
);