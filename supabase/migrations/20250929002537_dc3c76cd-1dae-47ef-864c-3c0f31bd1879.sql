-- Remove the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Campaign participants can view other participants in same campaign" ON public.campaign_participations;

-- Check if there are any duplicate policies with similar names
-- The original policy name was likely different, let's see what exists
-- We already have these working policies:
-- 1. "Artists can view participations for their campaigns"
-- 2. "Creators can view their own participations" 
-- 3. "Campaign participants can view other participants in same campa" (note the truncated name)

-- The existing policy "Campaign participants can view other participants in same campa" should handle leaderboard access
-- Let's verify it has the correct logic without infinite recursion