-- Update profiles table to support all 10 user types
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type IN (
    'artist', 
    'creator', 
    'visual_creative', 
    'dj', 
    'producer', 
    'collective', 
    'record_label', 
    'brand', 
    'studio', 
    'festival_event'
  ));