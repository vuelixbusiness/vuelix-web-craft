import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

const COLORS = {
  creator: '#FF6B6B',      // Soft red for creator connections
  artist: '#4ECDC4',       // Turquoise for artist connections
  campaign: '#95E1D3',     // Light green for campaign connections
  random: '#F38181',       // Coral for random connections
};

// Generate random position for visual distribution
const generatePosition = () => ({
  lat: (Math.random() - 0.5) * 140,  // -70 to 70
  lng: (Math.random() - 0.5) * 360,  // -180 to 180
});

export const useGlobeData = () => {
  return useQuery({
    queryKey: ['globe-arcs'],
    queryFn: async () => {
      console.log('🌐 Fetching globe arc data...');
      
      // Fetch creators and artists
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, user_type')
        .in('user_type', ['creator', 'artist']);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }
      console.log('✅ Profiles fetched:', profiles?.length);

      // Fetch active campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, title')
        .eq('status', 'active');

      if (campaignsError) {
        console.error('❌ Error fetching campaigns:', campaignsError);
        throw campaignsError;
      }
      console.log('✅ Campaigns fetched:', campaigns?.length);

      const arcs: ArcData[] = [];

      // Create positions for entities
      const creators = profiles?.filter(p => p.user_type === 'creator').map(p => ({
        ...p,
        ...generatePosition()
      })) || [];

      const artists = profiles?.filter(p => p.user_type === 'artist').map(p => ({
        ...p,
        ...generatePosition()
      })) || [];

      const campaignPositions = campaigns?.map(c => ({
        ...c,
        ...generatePosition()
      })) || [];

      // Create arcs connecting creators to campaigns
      creators.forEach((creator, i) => {
        const campaign = campaignPositions[i % campaignPositions.length];
        if (campaign) {
          arcs.push({
            startLat: creator.lat,
            startLng: creator.lng,
            endLat: campaign.lat,
            endLng: campaign.lng,
            color: COLORS.creator
          });
        }
      });

      // Create arcs connecting artists to campaigns
      artists.forEach((artist, i) => {
        const campaign = campaignPositions[(i + 1) % campaignPositions.length];
        if (campaign) {
          arcs.push({
            startLat: artist.lat,
            startLng: artist.lng,
            endLat: campaign.lat,
            endLng: campaign.lng,
            color: COLORS.artist
          });
        }
      });

      // Add some random connections for visual interest
      const minArcs = 15;
      while (arcs.length < minArcs) {
        arcs.push({
          startLat: (Math.random() - 0.5) * 140,
          startLng: (Math.random() - 0.5) * 360,
          endLat: (Math.random() - 0.5) * 140,
          endLng: (Math.random() - 0.5) * 360,
          color: COLORS.random
        });
      }

      console.log('🎯 Total arcs generated:', arcs.length);
      return arcs;
    },
    staleTime: 30000, // Refetch every 30 seconds
  });
};
