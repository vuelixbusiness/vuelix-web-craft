-- Demo Campaigns Data
-- Run this SQL in your Supabase SQL Editor to create 6 demo campaigns
-- Make sure to replace YOUR_USER_ID with an actual user ID from your profiles table

-- You can get user IDs by running: SELECT user_id FROM public.profiles LIMIT 6;

-- Demo Campaign 1: Summer Vibes
INSERT INTO public.campaigns (
  owner_id, artist_id, title, song_title, description,
  cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
  status, start_at, end_date, genre, platforms, campaign_type
) VALUES (
  'YOUR_USER_ID_1',  -- Replace with actual user ID
  'YOUR_USER_ID_1',
  'Summer Vibes 2024',
  'Summer Vibes 2024',
  'Help us promote our new summer anthem! Create engaging content featuring our latest track and share it across your platforms.',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  'https://spotify.com/track/summer-vibes-2024',
  'https://spotify.com/track/summer-vibes-2024',
  500,
  50000,
  500.00,
  'live',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '25 days',
  'pop',
  ARRAY['youtube', 'tiktok'],
  'bounty'
);

-- Demo Campaign 2: Underground Beats
INSERT INTO public.campaigns (
  owner_id, artist_id, title, song_title, description,
  cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
  status, start_at, end_date, genre, platforms, campaign_type
) VALUES (
  'YOUR_USER_ID_2',
  'YOUR_USER_ID_2',
  'Underground Beats Launch',
  'Underground Beats EP',
  'Join our underground hip-hop campaign. We''re looking for creative content creators to help launch our new EP.',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
  'https://soundcloud.com/underground-beats-ep',
  'https://soundcloud.com/underground-beats-ep',
  800,
  100000,
  1000.00,
  'live',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '27 days',
  'hip-hop',
  ARRAY['youtube', 'instagram'],
  'bounty'
);

-- Demo Campaign 3: Electronic Dreams
INSERT INTO public.campaigns (
  owner_id, artist_id, title, song_title, description,
  cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
  status, start_at, end_date, genre, platforms, campaign_type
) VALUES (
  'YOUR_USER_ID_3',
  'YOUR_USER_ID_3',
  'Electronic Dreams',
  'Electronic Dreams',
  'Calling all EDM lovers! Help us spread the word about our new electronic single with high-energy content.',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
  'https://spotify.com/track/electronic-dreams',
  'https://spotify.com/track/electronic-dreams',
  1200,
  150000,
  1500.00,
  'live',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '29 days',
  'electronic',
  ARRAY['youtube', 'tiktok', 'instagram'],
  'bounty'
);

-- Demo Campaign 4: Acoustic Sessions
INSERT INTO public.campaigns (
  owner_id, artist_id, title, song_title, description,
  cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
  status, start_at, end_date, genre, platforms, campaign_type
) VALUES (
  'YOUR_USER_ID_1',
  'YOUR_USER_ID_1',
  'Acoustic Sessions Vol. 1',
  'Acoustic Sessions',
  'Intimate acoustic performance series. Looking for creators who can capture the raw emotion of unplugged music.',
  'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
  'https://youtube.com/playlist/acoustic-sessions-v1',
  'https://youtube.com/playlist/acoustic-sessions-v1',
  300,
  30000,
  300.00,
  'live',
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '23 days',
  'acoustic',
  ARRAY['youtube'],
  'bounty'
);

-- Demo Campaign 5: Rock Revival
INSERT INTO public.campaigns (
  owner_id, artist_id, title, song_title, description,
  cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
  status, start_at, end_date, genre, platforms, campaign_type
) VALUES (
  'YOUR_USER_ID_2',
  'YOUR_USER_ID_2',
  'Rock Revival Tour',
  'Rock Revival',
  'Classic rock meets modern energy. Help us promote our upcoming tour with authentic rock content.',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800',
  'https://spotify.com/artist/rock-revival',
  'https://spotify.com/artist/rock-revival',
  1500,
  120000,
  1200.00,
  'live',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '28 days',
  'rock',
  ARRAY['youtube', 'instagram'],
  'bounty'
);

-- Demo Campaign 6: Jazz Lounge
INSERT INTO public.campaigns (
  owner_id, artist_id, title, song_title, description,
  cover_art_url, track_url, song_url, bounty_cents, budget_cents, budget,
  status, start_at, end_date, genre, platforms, campaign_type
) VALUES (
  'YOUR_USER_ID_3',
  'YOUR_USER_ID_3',
  'Jazz Lounge Experience',
  'Jazz Lounge',
  'Sophisticated jazz campaign for our new album. Seeking creators who appreciate the art of smooth jazz.',
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
  'https://spotify.com/album/jazz-lounge-experience',
  'https://spotify.com/album/jazz-lounge-experience',
  600,
  80000,
  800.00,
  'live',
  NOW() - INTERVAL '4 days',
  NOW() + INTERVAL '26 days',
  'jazz',
  ARRAY['youtube', 'spotify'],
  'bounty'
);
