-- Add hybrid_reward_description column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS hybrid_reward_description TEXT;