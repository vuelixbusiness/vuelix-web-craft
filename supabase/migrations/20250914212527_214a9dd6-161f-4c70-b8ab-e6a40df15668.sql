-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  title TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_url TEXT,
  cover_art_url TEXT,
  campaign_type TEXT NOT NULL, -- 'clipping', 'duet', 'reaction'
  genre TEXT NOT NULL,
  platforms TEXT[] NOT NULL, -- ['tiktok', 'youtube', 'instagram']
  payout_type TEXT NOT NULL, -- 'per_view', 'per_like', 'flat_rate'
  payout_rate DECIMAL(10,4) NOT NULL,
  vip_bonus DECIMAL(10,4) DEFAULT 0,
  max_payout DECIMAL(10,2),
  vip_max_payout DECIMAL(10,2),
  instructions TEXT,
  reference_links TEXT,
  approval_required BOOLEAN DEFAULT false,
  budget DECIMAL(10,2) NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign participations table
CREATE TABLE public.campaign_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'tiktok', 'youtube', 'instagram'
  video_id TEXT, -- extracted from URL for API calls
  initial_views INTEGER DEFAULT 0,
  current_views INTEGER DEFAULT 0,
  initial_likes INTEGER DEFAULT 0,
  current_likes INTEGER DEFAULT 0,
  last_tracked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payout_claimed BOOLEAN DEFAULT false,
  payout_amount DECIMAL(10,2) DEFAULT 0,
  payout_claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, creator_id, video_url)
);

-- Create view tracking logs table for historical data
CREATE TABLE public.view_tracking_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participation_id UUID NOT NULL REFERENCES public.campaign_participations(id) ON DELETE CASCADE,
  views INTEGER NOT NULL,
  likes INTEGER NOT NULL,
  tracked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.view_tracking_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Artists can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = artist_id);

CREATE POLICY "Everyone can view active campaigns" 
ON public.campaigns 
FOR SELECT 
USING (status = 'active');

-- RLS Policies for campaign participations
CREATE POLICY "Creators can view their own participations" 
ON public.campaign_participations 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create their own participations" 
ON public.campaign_participations 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own participations" 
ON public.campaign_participations 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Artists can view participations for their campaigns" 
ON public.campaign_participations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_participations.campaign_id 
  AND campaigns.artist_id = auth.uid()
));

-- RLS Policies for view tracking logs
CREATE POLICY "Users can view tracking logs for their participations" 
ON public.view_tracking_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.campaign_participations 
  WHERE campaign_participations.id = view_tracking_logs.participation_id 
  AND campaign_participations.creator_id = auth.uid()
));

CREATE POLICY "System can insert tracking logs" 
ON public.view_tracking_logs 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_participations_updated_at
  BEFORE UPDATE ON public.campaign_participations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_campaigns_artist_id ON public.campaigns(artist_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_participations_campaign_id ON public.campaign_participations(campaign_id);
CREATE INDEX idx_campaign_participations_creator_id ON public.campaign_participations(creator_id);
CREATE INDEX idx_campaign_participations_platform ON public.campaign_participations(platform);
CREATE INDEX idx_view_tracking_logs_participation_id ON public.view_tracking_logs(participation_id);
CREATE INDEX idx_view_tracking_logs_tracked_at ON public.view_tracking_logs(tracked_at);