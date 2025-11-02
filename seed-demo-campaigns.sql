-- Auto-seed demo campaigns using existing users
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ztrseijpesnmztuugmsi/sql/new

DO $$
DECLARE
  user1 uuid;
  user2 uuid;
  user3 uuid;
BEGIN
  -- Get first 3 user IDs from profiles
  SELECT user_id INTO user1 FROM public.profiles LIMIT 1 OFFSET 0;
  SELECT user_id INTO user2 FROM public.profiles LIMIT 1 OFFSET 1;
  SELECT user_id INTO user3 FROM public.profiles LIMIT 1 OFFSET 2;
  
  -- Only proceed if we have at least one user
  IF user1 IS NOT NULL THEN
    
    -- Campaign 1: Summer Vibes
    INSERT INTO public.campaigns (
      owner_id, artist_id, title, song_title, description,
      cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
      status, start_at, end_date, genre, platforms, campaign_type
    ) VALUES (
      user1, user1,
      'Summer Vibes 2024',
      'Summer Vibes',
      'Help us promote our new summer anthem! Create engaging content featuring our latest track.',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      'https://spotify.com/track/summer-vibes',
      'https://spotify.com/track/summer-vibes',
      500, 50000, 500.00,
      'live',
      NOW() - INTERVAL '5 days',
      NOW() + INTERVAL '25 days',
      'pop',
      ARRAY['youtube', 'tiktok'],
      'bounty'
    );
    
    -- Campaign 2: Underground Beats (if user2 exists)
    IF user2 IS NOT NULL THEN
      INSERT INTO public.campaigns (
        owner_id, artist_id, title, song_title, description,
        cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
        status, start_at, end_date, genre, platforms, campaign_type
      ) VALUES (
        user2, user2,
        'Underground Beats Launch',
        'Underground EP',
        'Join our underground hip-hop campaign. Looking for creative content creators to help launch our new EP.',
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
        'https://soundcloud.com/underground-beats',
        'https://soundcloud.com/underground-beats',
        800, 100000, 1000.00,
        'live',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '27 days',
        'hip-hop',
        ARRAY['youtube', 'instagram'],
        'bounty'
      );
    END IF;
    
    -- Campaign 3: Electronic Dreams (if user3 exists)
    IF user3 IS NOT NULL THEN
      INSERT INTO public.campaigns (
        owner_id, artist_id, title, song_title, description,
        cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
        status, start_at, end_date, genre, platforms, campaign_type
      ) VALUES (
        user3, user3,
        'Electronic Dreams',
        'Electronic Dreams',
        'Calling all EDM lovers! Help spread the word about our new electronic single with high-energy content.',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
        'https://spotify.com/track/electronic-dreams',
        'https://spotify.com/track/electronic-dreams',
        1200, 150000, 1500.00,
        'live',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '29 days',
        'electronic',
        ARRAY['youtube', 'tiktok', 'instagram'],
        'bounty'
      );
    END IF;
    
    -- Campaign 4: Acoustic Sessions
    INSERT INTO public.campaigns (
      owner_id, artist_id, title, song_title, description,
      cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
      status, start_at, end_date, genre, platforms, campaign_type
    ) VALUES (
      user1, user1,
      'Acoustic Sessions Vol. 1',
      'Acoustic Sessions',
      'Intimate acoustic performance series. Looking for creators who can capture raw emotion.',
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
      'https://youtube.com/playlist/acoustic-v1',
      'https://youtube.com/playlist/acoustic-v1',
      300, 30000, 300.00,
      'live',
      NOW() - INTERVAL '7 days',
      NOW() + INTERVAL '23 days',
      'acoustic',
      ARRAY['youtube'],
      'bounty'
    );
    
    -- Campaign 5: Rock Revival
    IF user2 IS NOT NULL THEN
      INSERT INTO public.campaigns (
        owner_id, artist_id, title, song_title, description,
        cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
        status, start_at, end_date, genre, platforms, campaign_type
      ) VALUES (
        user2, user2,
        'Rock Revival Tour',
        'Rock Revival',
        'Classic rock meets modern energy. Help us promote our upcoming tour with authentic content.',
        'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800',
        'https://spotify.com/artist/rock-revival',
        'https://spotify.com/artist/rock-revival',
        1500, 120000, 1200.00,
        'live',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '28 days',
        'rock',
        ARRAY['youtube', 'instagram'],
        'bounty'
      );
    END IF;
    
    -- Campaign 6: Jazz Lounge
    IF user3 IS NOT NULL THEN
      INSERT INTO public.campaigns (
        owner_id, artist_id, title, song_title, description,
        cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
        status, start_at, end_date, genre, platforms, campaign_type
      ) VALUES (
        user3, user3,
        'Jazz Lounge Experience',
        'Jazz Lounge',
        'Sophisticated jazz campaign for our new album. Seeking creators who appreciate smooth jazz.',
        'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
        'https://spotify.com/album/jazz-lounge',
        'https://spotify.com/album/jazz-lounge',
        600, 80000, 800.00,
        'live',
        NOW() - INTERVAL '4 days',
        NOW() + INTERVAL '26 days',
        'jazz',
        ARRAY['youtube', 'spotify'],
        'bounty'
      );
    END IF;
    
    RAISE NOTICE 'Successfully seeded demo campaigns!';
  ELSE
    RAISE EXCEPTION 'No users found in profiles table. Please create a user account first.';
  END IF;
END $$;
