-- Add RLS policy to allow artists to view participant profiles
CREATE POLICY "Artists can view participant profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM campaign_participations cp
  JOIN campaigns c ON c.id = cp.campaign_id
  WHERE cp.creator_id = profiles.user_id 
  AND c.artist_id = auth.uid()
));