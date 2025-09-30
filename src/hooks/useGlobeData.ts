import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SatelliteEntity {
  id: string;
  name: string;
  type: 'creator' | 'artist' | 'campaign';
  lat: number;
  lng: number;
  alt: number;
  color: string;
}

const COLORS = {
  creator: '#DC143C',  // Crimson red
  artist: '#8B00FF',   // Dark electric purple
  campaign: '#FFFFFF', // White
};

// Generate random position for visual distribution
const generatePosition = () => ({
  lat: Math.random() * 140 - 70,  // -70 to 70
  lng: Math.random() * 360 - 180, // -180 to 180
  alt: 0.015 + Math.random() * 0.015, // 0.015 to 0.03
});

export const useGlobeData = () => {
  return useQuery({
    queryKey: ['globe-satellites'],
    queryFn: async () => {
      console.log('🛰️ Fetching globe data...');
      
      // Fetch creators and artists
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, user_type')
        .in('user_type', ['creator', 'artist']);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }
      console.log('✅ Profiles fetched:', profiles?.length, profiles);

      // Fetch active campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, title')
        .eq('status', 'active');

      if (campaignsError) {
        console.error('❌ Error fetching campaigns:', campaignsError);
        throw campaignsError;
      }
      console.log('✅ Campaigns fetched:', campaigns?.length, campaigns);

      const satellites: SatelliteEntity[] = [];

      // Add creators
      profiles?.filter(p => p.user_type === 'creator').forEach((profile) => {
        satellites.push({
          id: profile.user_id,
          name: profile.display_name || profile.username || 'Creator',
          type: 'creator',
          ...generatePosition(),
          color: COLORS.creator,
        });
      });

      // Add artists
      profiles?.filter(p => p.user_type === 'artist').forEach((profile) => {
        satellites.push({
          id: profile.user_id,
          name: profile.display_name || profile.username || 'Artist',
          type: 'artist',
          ...generatePosition(),
          color: COLORS.artist,
        });
      });

      // Add campaigns
      campaigns?.forEach((campaign) => {
        satellites.push({
          id: campaign.id,
          name: campaign.title,
          type: 'campaign',
          ...generatePosition(),
          color: COLORS.campaign,
        });
      });

      console.log('🎯 Total satellites generated:', satellites.length, satellites);
      return satellites;
    },
    staleTime: 30000, // Refetch every 30 seconds
  });
};
