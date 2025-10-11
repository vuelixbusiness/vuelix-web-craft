-- Create app_role enum for all user categories
CREATE TYPE public.app_role AS ENUM (
  'artist',
  'creator', 
  'dj',
  'producer',
  'visual_creative',
  'brand',
  'record_label',
  'music_group',
  'collective',
  'event_organizer'
);

-- Create user_roles table for multi-role support
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id AND is_primary = true
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Migrate existing user_type to user_roles
INSERT INTO public.user_roles (user_id, role, is_primary)
SELECT user_id, 
       user_type::app_role,
       true
FROM public.profiles
WHERE user_type IN ('artist', 'creator')
ON CONFLICT (user_id, role) DO NOTHING;