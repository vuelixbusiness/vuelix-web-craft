-- Create campaign_activities table to track all campaign-related events
CREATE TABLE public.campaign_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campaign_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign activities
CREATE POLICY "Users can view activities for campaigns they participate in or own" 
ON public.campaign_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_activities.campaign_id 
    AND (c.artist_id = auth.uid() OR c.status = 'active')
  ) OR 
  EXISTS (
    SELECT 1 FROM public.campaign_participations cp 
    WHERE cp.campaign_id = campaign_activities.campaign_id 
    AND cp.creator_id = auth.uid()
  )
);

CREATE POLICY "System can create campaign activities" 
ON public.campaign_activities 
FOR INSERT 
WITH CHECK (true);

-- Add index for better performance
CREATE INDEX idx_campaign_activities_campaign_id ON public.campaign_activities(campaign_id);
CREATE INDEX idx_campaign_activities_created_at ON public.campaign_activities(created_at DESC);

-- Add trigger for updated_at column if needed in future
-- For now, we only need created_at since activities are immutable

-- Enable realtime for campaign activities
ALTER publication supabase_realtime ADD TABLE campaign_activities;