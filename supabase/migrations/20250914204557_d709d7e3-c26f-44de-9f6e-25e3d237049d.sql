-- Temporarily mark all unverified emails as verified for testing
-- WARNING: This should only be used for development/testing
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;