-- Create a secure function to resolve username to email
CREATE OR REPLACE FUNCTION public.resolve_username_to_email(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE lower(username) = lower(p_username)
  LIMIT 1;
  
  RETURN v_email;
END;
$$;

-- Grant execute permission to anon users (needed for login)
GRANT EXECUTE ON FUNCTION public.resolve_username_to_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.resolve_username_to_email(text) TO authenticated;