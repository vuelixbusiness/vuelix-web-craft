-- Step 1: First ensure all auth users have profiles
-- Insert missing profiles for users who might not have them
INSERT INTO profiles (user_id, username, display_name, user_type, membership_type)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'username', 'user_' || substring(id::text, 1, 8)),
    COALESCE(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name'),
    COALESCE(raw_user_meta_data->>'user_type', 'creator'),
    'regular'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM profiles)
ON CONFLICT (user_id) DO NOTHING;