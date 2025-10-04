import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GlobeUser {
  user_id: string;
  username: string;
  display_name: string | null;
  user_type: string;
  avatar_url: string | null;
}

export function useGlobeUserData() {
  return useQuery({
    queryKey: ['globe-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, user_type, avatar_url')
        .eq('public_visibility', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GlobeUser[];
    },
    staleTime: 60000, // Refetch every minute
  });
}
