-- Seed 12 Demo Campaigns for Testing
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Get the profile ID for the user
  SELECT id INTO v_profile_id 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'No profile found for current user';
  END IF;

  -- Insert 12 diverse demo campaigns
  INSERT INTO public.campaigns (
    artist_id,
    title,
    song_title,
    genre,
    platforms,
    campaign_type,
    campaign_mode,
    payout_type,
    payout_rate,
    budget,
    status,
    start_at,
    end_date,
    instructions,
    rules
  )
  VALUES
    -- Campaign 1: Hip Hop TikTok Viral
    (
      v_profile_id,
      'Viral TikTok Challenge - Street Anthem',
      'Street Anthem',
      'hip hop',
      ARRAY['tiktok'],
      'bounty',
      'reward_others',
      'performance_based',
      0.02,
      5000,
      'active',
      NOW(),
      NOW() + INTERVAL '30 days',
      'Create a dance challenge or creative video using our new track. Show your best moves!',
      '• Post on TikTok with #StreetAnthem
• Tag @artist in your video
• Keep video public for campaign duration
• Original content only'
    ),
    -- Campaign 2: Pop Instagram Reels
    (
      v_profile_id,
      'Summer Vibes - Instagram Takeover',
      'Summer Nights',
      'pop',
      ARRAY['instagram'],
      'bounty',
      'reward_others',
      'fixed_rate',
      50,
      3000,
      'active',
      NOW(),
      NOW() + INTERVAL '45 days',
      'Create amazing Reels showcasing summer vibes with our latest pop hit',
      '• Post on Instagram Reels
• Use #SummerNights hashtag
• Minimum 15 seconds
• Keep content family-friendly'
    ),
    -- Campaign 3: R&B Multi-Platform
    (
      v_profile_id,
      'Smooth R&B Vibes Campaign',
      'Midnight Drive',
      'r&b',
      ARRAY['tiktok', 'instagram', 'youtube'],
      'bounty',
      'reward_others',
      'hybrid',
      0.015,
      7500,
      'active',
      NOW(),
      NOW() + INTERVAL '60 days',
      'Share your favorite moments with our smooth R&B track across all platforms',
      '• Post on any platform listed
• Tag @artist
• Use #MidnightDrive
• Authentic content preferred'
    ),
    -- Campaign 4: Electronic Music YouTube
    (
      v_profile_id,
      'EDM Festival Energy Campaign',
      'Bass Drop',
      'electronic',
      ARRAY['youtube'],
      'bounty',
      'reward_others',
      'performance_based',
      0.03,
      10000,
      'active',
      NOW(),
      NOW() + INTERVAL '90 days',
      'Create high-energy videos featuring our EDM track perfect for festival season',
      '• Upload to YouTube
• Minimum 1 minute duration
• Include track credit in description
• Festival/party vibes encouraged'
    ),
    -- Campaign 5: Country Music TikTok
    (
      v_profile_id,
      'Country Roads Campaign',
      'Backroads & Tailgates',
      'country',
      ARRAY['tiktok', 'instagram'],
      'bounty',
      'reward_others',
      'fixed_rate',
      75,
      4000,
      'active',
      NOW(),
      NOW() + INTERVAL '30 days',
      'Show us your country lifestyle with our new country anthem',
      '• TikTok or Instagram Reels
• Authentic country vibes
• Tag @artist
• Use #BackroadsTailgates'
    ),
    -- Campaign 6: Rock Music YouTube
    (
      v_profile_id,
      'Rock Revolution Campaign',
      'Breaking Free',
      'rock',
      ARRAY['youtube'],
      'bounty',
      'reward_others',
      'performance_based',
      0.025,
      6000,
      'active',
      NOW(),
      NOW() + INTERVAL '45 days',
      'Create epic rock-themed content featuring our new single',
      '• YouTube videos only
• Rock aesthetic required
• Credit artist in description
• Show your rebel spirit'
    ),
    -- Campaign 7: Indie Multi-Platform
    (
      v_profile_id,
      'Indie Vibes Creative Campaign',
      'Wanderlust Dreams',
      'indie',
      ARRAY['tiktok', 'instagram', 'youtube'],
      'bounty',
      'reward_others',
      'hybrid',
      0.02,
      5500,
      'active',
      NOW(),
      NOW() + INTERVAL '60 days',
      'Express your creativity with our indie track - all artistic styles welcome',
      '• Any platform listed
• Creative freedom encouraged
• Tag @artist
• Use #WanderlustDreams'
    ),
    -- Campaign 8: Latin Music TikTok
    (
      v_profile_id,
      'Latin Rhythm Dance Challenge',
      'Fuego',
      'latin',
      ARRAY['tiktok'],
      'bounty',
      'reward_others',
      'fixed_rate',
      60,
      3500,
      'active',
      NOW(),
      NOW() + INTERVAL '30 days',
      'Show us your best dance moves to our hot new Latin track',
      '• TikTok only
• Dance challenge format
• Use #FuegoDanceChallenge
• Tag 3 friends'
    ),
    -- Campaign 9: Jazz YouTube Premium
    (
      v_profile_id,
      'Smooth Jazz Sessions',
      'Midnight Blues',
      'jazz',
      ARRAY['youtube'],
      'bounty',
      'reward_others',
      'performance_based',
      0.04,
      8000,
      'active',
      NOW(),
      NOW() + INTERVAL '90 days',
      'Create sophisticated content featuring our jazz composition',
      '• YouTube long-form content
• High production value
• Credit artist prominently
• Jazz aesthetic required'
    ),
    -- Campaign 10: Pop TikTok Mega Campaign
    (
      v_profile_id,
      'Mega Pop Sensation Campaign',
      'Starlight',
      'pop',
      ARRAY['tiktok', 'instagram'],
      'bounty',
      'reward_others',
      'performance_based',
      0.025,
      15000,
      'active',
      NOW(),
      NOW() + INTERVAL '60 days',
      'Join our biggest campaign yet! Create viral content with our chart-topping hit',
      '• TikTok or Instagram
• Use #StarlightChallenge
• Maximum creativity
• Tag @artist for features'
    ),
    -- Campaign 11: Reggae Instagram
    (
      v_profile_id,
      'Island Vibes Campaign',
      'Sunset Paradise',
      'reggae',
      ARRAY['instagram'],
      'bounty',
      'reward_others',
      'fixed_rate',
      55,
      2500,
      'active',
      NOW(),
      NOW() + INTERVAL '45 days',
      'Share your island paradise moments with our reggae track',
      '• Instagram Reels or Posts
• Beach/tropical vibes
• Use #SunsetParadise
• Positive energy only'
    ),
    -- Campaign 12: Hip Hop YouTube Premium
    (
      v_profile_id,
      'Underground Hip Hop Movement',
      'City Lights',
      'hip hop',
      ARRAY['youtube'],
      'bounty',
      'reward_others',
      'performance_based',
      0.035,
      12000,
      'active',
      NOW(),
      NOW() + INTERVAL '75 days',
      'Represent the underground scene with our raw hip hop track',
      '• YouTube videos
• Urban aesthetic
• Credit artist in description
• Authentic street culture'
    );

  RAISE NOTICE '✅ Successfully created 12 demo campaigns!';
END $$;
