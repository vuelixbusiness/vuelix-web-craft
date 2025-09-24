-- Enhance notifications table with additional fields
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'system' CHECK (category IN ('campaign', 'payout', 'system', 'message')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT,
  p_category TEXT DEFAULT 'system',
  p_priority TEXT DEFAULT 'medium',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, message, category, priority, metadata)
  VALUES (p_user_id, p_type, p_message, p_category, p_priority, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for campaign participation notifications
CREATE OR REPLACE FUNCTION public.notify_campaign_participation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  campaign_record RECORD;
  artist_id UUID;
  creator_profile RECORD;
BEGIN
  -- Get campaign and artist info
  SELECT * INTO campaign_record FROM campaigns WHERE id = NEW.campaign_id;
  artist_id := campaign_record.artist_id;
  
  -- Get creator profile info
  SELECT username, display_name INTO creator_profile 
  FROM profiles 
  WHERE user_id = NEW.creator_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify artist when creator joins their campaign
    PERFORM create_notification(
      artist_id,
      'campaign_join',
      format('Creator @%s joined your campaign "%s"', 
        COALESCE(creator_profile.username, 'unknown'), 
        campaign_record.title),
      'campaign',
      'medium',
      jsonb_build_object(
        'campaign_id', NEW.campaign_id,
        'creator_id', NEW.creator_id,
        'participation_id', NEW.id
      )
    );
    
    -- Notify creator about successful join
    PERFORM create_notification(
      NEW.creator_id,
      'campaign_joined',
      format('You successfully joined the campaign "%s"', campaign_record.title),
      'campaign',
      'medium',
      jsonb_build_object(
        'campaign_id', NEW.campaign_id,
        'participation_id', NEW.id
      )
    );
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify creator when status changes
    PERFORM create_notification(
      NEW.creator_id,
      'status_update',
      format('Your submission for "%s" has been %s', 
        campaign_record.title, 
        NEW.status),
      'campaign',
      CASE 
        WHEN NEW.status IN ('approved', 'live') THEN 'high'
        WHEN NEW.status = 'rejected' THEN 'medium'
        ELSE 'low'
      END,
      jsonb_build_object(
        'campaign_id', NEW.campaign_id,
        'participation_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
    
    -- Notify artist about status changes they care about
    IF NEW.status IN ('submitted', 'live') THEN
      PERFORM create_notification(
        artist_id,
        'participation_update',
        format('Creator @%s submission for "%s" is now %s', 
          COALESCE(creator_profile.username, 'unknown'),
          campaign_record.title,
          NEW.status),
        'campaign',
        'medium',
        jsonb_build_object(
          'campaign_id', NEW.campaign_id,
          'creator_id', NEW.creator_id,
          'participation_id', NEW.id,
          'status', NEW.status
        )
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for campaign participations
DROP TRIGGER IF EXISTS campaign_participation_notifications ON public.campaign_participations;
CREATE TRIGGER campaign_participation_notifications
  AFTER INSERT OR UPDATE ON public.campaign_participations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_campaign_participation();

-- Update trigger for notifications updated_at
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();