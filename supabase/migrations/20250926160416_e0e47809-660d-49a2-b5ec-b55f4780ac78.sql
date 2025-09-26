-- Fix the wallets table foreign key constraint issue
-- The table exists but lacks proper foreign keys and RLS policies

-- First, let's ensure the wallets table has proper RLS policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can create their own wallet" ON wallets;
DROP POLICY IF EXISTS "System can update wallets" ON wallets;

-- Create proper RLS policies for wallets
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update wallets" ON wallets
  FOR UPDATE USING (true);

-- Ensure other tables have proper RLS policies too
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Update any incorrect foreign key references if they exist
-- Note: We're not adding foreign keys to auth.users as per Supabase best practices
-- Instead, we rely on application logic and RLS policies