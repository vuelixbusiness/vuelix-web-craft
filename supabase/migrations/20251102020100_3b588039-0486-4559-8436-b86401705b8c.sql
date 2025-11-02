-- Add missing columns to campaigns table for the restored Campaigns feature
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS track_url text,
  ADD COLUMN IF NOT EXISTS bounty_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS start_at timestamp with time zone DEFAULT now();

-- Create campaign_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campaign_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS on campaign_participants
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_participants
CREATE POLICY "Public can view campaign participants"
  ON public.campaign_participants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join campaigns"
  ON public.campaign_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update campaigns RLS for the new owner_id column
CREATE POLICY "Public can view live and ended campaigns"
  ON public.campaigns FOR SELECT
  USING (status IN ('live', 'ended') OR owner_id = auth.uid());

CREATE POLICY "Owners can update their campaigns"
  ON public.campaigns FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert their campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Create storage bucket for campaign covers if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-covers', 'campaign-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaign-covers bucket
CREATE POLICY "Public can view campaign covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaign-covers');

CREATE POLICY "Authenticated users can upload campaign covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'campaign-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update their campaign covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'campaign-covers' AND auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status_start ON public.campaigns(status, start_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON public.campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON public.campaign_participants(user_id);