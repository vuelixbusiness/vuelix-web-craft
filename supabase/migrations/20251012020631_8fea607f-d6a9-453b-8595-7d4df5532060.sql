-- Fix Security Warning Issues (warn level only)

-- 1. Drop campaign_listings view - not used in code and has no RLS
-- This eliminates potential data exposure through unprotected view
DROP VIEW IF EXISTS campaign_listings CASCADE;

-- 2. Fix public_profiles view to respect public_visibility setting
-- Recreate view with proper filtering for user privacy
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  user_type
FROM profiles
WHERE public_visibility = true;  -- Only expose profiles marked as public

-- 3. Add server-side validation for chat messages
-- Prevents storage exhaustion and DoS attacks via oversized messages
CREATE OR REPLACE FUNCTION validate_message_content()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reject messages exceeding 5000 characters
  IF length(NEW.content) > 5000 THEN
    RAISE EXCEPTION 'Message content exceeds 5000 character limit';
  END IF;
  
  -- Reject empty messages (after trimming)
  IF length(trim(NEW.content)) = 0 THEN
    RAISE EXCEPTION 'Message content cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation trigger to messages table
DROP TRIGGER IF EXISTS check_message_content ON messages;
CREATE TRIGGER check_message_content
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW 
  EXECUTE FUNCTION validate_message_content();