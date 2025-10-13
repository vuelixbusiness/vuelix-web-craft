-- Allow public viewing of active campaigns
CREATE POLICY "Public can view active campaigns"
ON public.campaigns
FOR SELECT
USING (status = 'active');