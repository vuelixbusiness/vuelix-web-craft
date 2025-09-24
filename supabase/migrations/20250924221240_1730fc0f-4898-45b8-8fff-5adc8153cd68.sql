-- Add RLS policy to allow artists to update participations for their campaigns
CREATE POLICY "Artists can update participations for their campaigns" 
ON public.campaign_participations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM campaigns 
  WHERE campaigns.id = campaign_participations.campaign_id 
  AND campaigns.artist_id = auth.uid()
));