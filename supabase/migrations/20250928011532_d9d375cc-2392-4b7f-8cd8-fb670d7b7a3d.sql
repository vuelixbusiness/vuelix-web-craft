-- Make video_url and platform nullable in campaign_participations table
-- This allows users to join campaigns without immediately submitting videos

ALTER TABLE public.campaign_participations 
ALTER COLUMN video_url DROP NOT NULL,
ALTER COLUMN platform DROP NOT NULL;