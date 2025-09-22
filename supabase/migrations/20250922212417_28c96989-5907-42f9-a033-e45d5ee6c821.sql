-- Fix the handle_new_user function to properly save user type from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name, user_type, membership_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'creator'),
    'regular'
  );
  RETURN NEW;
END;
$function$;

-- Update existing users who should be artists based on their campaign creation
UPDATE public.profiles 
SET user_type = 'artist' 
WHERE user_id IN (
  SELECT DISTINCT artist_id 
  FROM public.campaigns
);