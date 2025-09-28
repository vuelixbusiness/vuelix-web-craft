-- Add RLS policy to allow authenticated users to count creators for statistics
CREATE POLICY "Authenticated users can count creators for statistics" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_type = 'creator' AND auth.uid() IS NOT NULL);