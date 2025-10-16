-- Add campaign_mode column to campaigns table to distinguish between "reward others" and "get rewarded" campaigns
ALTER TABLE campaigns 
ADD COLUMN campaign_mode TEXT DEFAULT 'reward_others' CHECK (campaign_mode IN ('reward_others', 'get_rewarded'));