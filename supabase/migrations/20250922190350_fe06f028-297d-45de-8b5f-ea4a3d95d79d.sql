-- Enable RLS on all tables that need it
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Support tickets policies
CREATE POLICY "Users can view their own support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Payout requests policies
CREATE POLICY "Users can view their own payout requests" 
ON public.payout_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payout requests" 
ON public.payout_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

-- Wallets policies
CREATE POLICY "Users can view their own wallet" 
ON public.wallets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet" 
ON public.wallets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update wallets" 
ON public.wallets 
FOR UPDATE 
USING (true);

-- Content creations policies
CREATE POLICY "Users can view their own content creations" 
ON public.content_creations 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can create their own content creations" 
ON public.content_creations 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

-- Creator rewards policies
CREATE POLICY "Users can view their own creator rewards" 
ON public.creator_rewards 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "System can create creator rewards" 
ON public.creator_rewards 
FOR INSERT 
WITH CHECK (true);

-- Engagement metrics policies
CREATE POLICY "Users can view engagement metrics for their content" 
ON public.engagement_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.content_creations 
  WHERE content_creations.id = content_id 
  AND content_creations.creator_id = auth.uid()
));

CREATE POLICY "System can create engagement metrics" 
ON public.engagement_metrics 
FOR INSERT 
WITH CHECK (true);

-- Media assets policies
CREATE POLICY "Users can view their own media assets" 
ON public.media_assets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own media assets" 
ON public.media_assets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media assets" 
ON public.media_assets 
FOR UPDATE 
USING (auth.uid() = user_id);