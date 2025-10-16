-- Add starting_rate column for service campaigns (get_rewarded mode)
ALTER TABLE campaigns 
ADD COLUMN starting_rate numeric NULL;

-- Update existing service campaigns to populate starting_rate from budget
UPDATE campaigns
SET starting_rate = budget
WHERE campaign_mode = 'get_rewarded'
AND starting_rate IS NULL;