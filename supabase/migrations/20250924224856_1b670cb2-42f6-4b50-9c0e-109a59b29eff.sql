-- Fix foreign key constraint for notifications
-- Drop the existing foreign key constraint that references profiles.id
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Add new foreign key constraint that references profiles.user_id
-- This matches what auth.uid() returns in the trigger functions
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;