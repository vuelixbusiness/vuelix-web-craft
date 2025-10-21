-- Set default to true for future users so location sharing is opt-out instead of opt-in
ALTER TABLE profiles 
ALTER COLUMN share_location_on_globe SET DEFAULT true;

-- Update existing users who have set a location to share it by default
UPDATE profiles 
SET share_location_on_globe = true 
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND share_location_on_globe = false;