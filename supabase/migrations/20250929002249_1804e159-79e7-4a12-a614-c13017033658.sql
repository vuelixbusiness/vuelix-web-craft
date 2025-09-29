-- Add RLS policy to allow campaign participants to view other participants in the same campaign
CREATE POLICY "Campaign participants can view other participants in same campaign" 
ON public.campaign_participations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.campaign_participations my_participation
    WHERE my_participation.creator_id = auth.uid() 
      AND my_participation.campaign_id = campaign_participations.campaign_id
      AND my_participation.status IN ('joined', 'approved', 'live', 'submitted')
  )
);