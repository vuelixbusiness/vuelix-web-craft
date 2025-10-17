-- Add achievement badges column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN achievement_badges JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN campaigns.achievement_badges IS 'Array of badge configurations that participants can earn from the campaign';