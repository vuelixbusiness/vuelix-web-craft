-- Remove the overly permissive "Users can view all profiles" policy
-- This policy allowed anyone to read all user profiles, exposing personal information
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- The existing "Users can view their own profile" policy remains intact
-- This ensures users can still access their own profile data while protecting privacy