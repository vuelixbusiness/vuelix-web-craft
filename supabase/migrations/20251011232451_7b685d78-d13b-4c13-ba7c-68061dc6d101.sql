-- Add latitude and longitude fields to profiles table for precise globe positioning
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add index for location queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add a comment to explain the fields
COMMENT ON COLUMN profiles.latitude IS 'User latitude for globe visualization';
COMMENT ON COLUMN profiles.longitude IS 'User longitude for globe visualization';
COMMENT ON COLUMN profiles.city IS 'User city name';
COMMENT ON COLUMN profiles.country IS 'User country name';