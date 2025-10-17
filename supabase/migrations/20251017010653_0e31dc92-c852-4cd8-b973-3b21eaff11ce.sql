-- Drop existing foreign keys pointing to auth.users
ALTER TABLE user_followers
DROP CONSTRAINT IF EXISTS user_followers_follower_id_fkey;

ALTER TABLE user_followers
DROP CONSTRAINT IF EXISTS user_followers_followed_id_fkey;

-- Add new foreign keys pointing to profiles
ALTER TABLE user_followers
ADD CONSTRAINT user_followers_follower_id_fkey
FOREIGN KEY (follower_id)
REFERENCES profiles(user_id)
ON DELETE CASCADE;

ALTER TABLE user_followers
ADD CONSTRAINT user_followers_followed_id_fkey
FOREIGN KEY (followed_id)
REFERENCES profiles(user_id)
ON DELETE CASCADE;