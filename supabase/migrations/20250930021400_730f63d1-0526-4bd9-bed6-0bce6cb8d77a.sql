-- Allow public (anon) users to view basic profile info for the Discovery page
CREATE POLICY "Public users can view basic profile info for discovery"
ON public.profiles
FOR SELECT
TO anon
USING (true);