-- Add share_location_on_globe column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS share_location_on_globe BOOLEAN DEFAULT false;

-- Create index for faster queries on location-sharing users
CREATE INDEX IF NOT EXISTS idx_profiles_share_location 
ON public.profiles(share_location_on_globe) 
WHERE share_location_on_globe = true;