-- Add RLS policy to allow campaign participants to view other participants in the same campaign
CREATE POLICY "Campaign participants can view other participants in same campaign" 
ON public.campaign_participations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.campaign_participations cp_user
    WHERE cp_user.creator_id = auth.uid() 
      AND cp_user.campaign_id = campaign_participations.campaign_id
      AND cp_user.status IN ('joined', 'approved')
  )
);