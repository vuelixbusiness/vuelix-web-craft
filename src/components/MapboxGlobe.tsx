import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { getUserTypeColor, getUserTypeIcon } from '@/utils/userTypeColors';

interface UserLocation {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  user_type: string;
  membership_type: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  avatar_url?: string;
}

export function MapboxGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const rotationInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      console.log('🔑 Fetching Mapbox token...');
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        console.log('✅ Mapbox token fetched successfully');
        setMapboxToken(data.token);
      } catch (error) {
        console.error('❌ Failed to fetch Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  // Fetch user locations from database
  useEffect(() => {
    const fetchUserLocations = async () => {
      console.log('📍 Fetching user locations from database...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, user_type, membership_type, latitude, longitude, city, country')
        .eq('share_location_on_globe', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('❌ Error fetching user locations:', error);
        return;
      }

      console.log('✅ Fetched user locations:', data?.length || 0, 'locations');
      if (data && data.length > 0) {
        console.log('📊 Location data sample:', data[0]);
        data.forEach((loc, i) => {
          console.log(`  ${i + 1}. @${loc.username} - ${loc.city}, ${loc.country} (${loc.latitude}, ${loc.longitude})`);
        });
      }
      setUserLocations(data || []);
    };

    fetchUserLocations();

    // Set up realtime subscription for location updates
    const channel = supabase
      .channel('profile-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'share_location_on_globe=eq.true'
        },
        () => {
          fetchUserLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    console.log('🗺️ Initializing Mapbox map...');
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: { name: 'globe' },
      zoom: 1.2,
      center: [30, 15],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Wait for map to load before allowing marker addition
    map.current.on('load', () => {
      console.log('✅ Map fully loaded and ready');
      setMapLoaded(true);
    });

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      if (!map.current) return;
      console.log('🎨 Map style loaded');
      
      map.current.setFog({
        color: 'rgb(30, 27, 59)',
        'high-color': 'rgb(50, 50, 100)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(15, 13, 30)',
        'star-intensity': 0.6,
      });
    });

    // Auto-rotation functionality
    const startRotation = () => {
      if (rotationInterval.current) {
        clearInterval(rotationInterval.current);
      }
      
      rotationInterval.current = setInterval(() => {
        if (!isInteracting && map.current) {
          const center = map.current.getCenter();
          center.lng += 0.5;
          map.current.easeTo({ center, duration: 1000, easing: (t) => t });
        }
      }, 1000);
    };

    // Handle user interaction
    map.current.on('mousedown', () => setIsInteracting(true));
    map.current.on('touchstart', () => setIsInteracting(true));
    map.current.on('dragstart', () => setIsInteracting(true));
    
    map.current.on('mouseup', () => {
      setIsInteracting(false);
      startRotation();
    });
    map.current.on('touchend', () => {
      setIsInteracting(false);
      startRotation();
    });
    map.current.on('dragend', () => {
      setIsInteracting(false);
      startRotation();
    });

    // Start rotation
    startRotation();

    return () => {
      if (rotationInterval.current) {
        clearInterval(rotationInterval.current);
      }
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add markers for user locations
  useEffect(() => {
    if (!map.current || !mapLoaded || userLocations.length === 0) {
      console.log('⏳ Waiting for map and locations...', { 
        hasMap: !!map.current, 
        mapLoaded, 
        locationsCount: userLocations.length 
      });
      return;
    }

    console.log('📌 Adding markers to map for', userLocations.length, 'users');

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for each user
    userLocations.forEach((user, index) => {
      if (!map.current) return;

      console.log(`  Adding marker ${index + 1}/${userLocations.length} for @${user.username} at [${user.longitude}, ${user.latitude}]`);

      // Determine color based on user type
      const markerColor = user.membership_type === 'vip' 
        ? '#FFD700'
        : getUserTypeColor(user.user_type);

      const userIcon = user.membership_type === 'vip'
        ? '⭐'
        : getUserTypeIcon(user.user_type);

      const userLabel = user.membership_type === 'vip' ? 'VIP' : user.user_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = markerColor;
      el.style.width = '10px';
      el.style.height = '10px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid rgba(255, 255, 255, 0.9)';
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.3s ease';
      el.style.boxShadow = `0 0 8px ${markerColor}`;

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
        el.style.boxShadow = `0 0 15px ${markerColor}`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = `0 0 8px ${markerColor}`;
      });

      // Create popup with user info
      const locationText = user.city && user.country 
        ? `${user.city}, ${user.country}`
        : user.country || 'Location set';

      const avatarUrl = user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username;

      const popup = new mapboxgl.Popup({ 
        offset: 15,
        closeButton: true,
        className: 'globe-popup'
      }).setHTML(`
        <div style="
          padding: 16px; 
          font-family: system-ui; 
          color: #fff; 
          background: linear-gradient(135deg, rgba(30, 27, 59, 0.98), rgba(50, 50, 100, 0.98));
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 200px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <img 
              src="${avatarUrl}" 
              alt="${user.username}" 
              style="
                width: 48px; 
                height: 48px; 
                border-radius: 50%; 
                border: 2px solid ${markerColor};
                object-fit: cover;
              "
            />
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 15px; margin-bottom: 3px;">
                @${user.username}
              </div>
              <div style="font-size: 11px; color: ${markerColor}; font-weight: 500; text-transform: capitalize;">
                ${userLabel}
              </div>
            </div>
          </div>
          <div style="font-size: 12px; color: #ddd; margin-bottom: 3px;">
            ${user.display_name || 'No display name'}
          </div>
          <div style="font-size: 11px; color: #aaa; margin-bottom: 12px;">
            📍 ${locationText}
          </div>
          <a 
            href="/profile/${user.username}" 
            style="
              display: block;
              text-align: center;
              background: ${markerColor};
              color: #fff;
              padding: 8px 16px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 13px;
              font-weight: 600;
              transition: opacity 0.2s;
            "
            onmouseover="this.style.opacity='0.85'"
            onmouseout="this.style.opacity='1'"
          >
            Browse Profile
          </a>
        </div>
      `);

      // Create and add marker
      try {
        const marker = new mapboxgl.Marker(el)
          .setLngLat([user.longitude, user.latitude])
          .setPopup(popup)
          .addTo(map.current);

        markers.current.push(marker);
        console.log(`  ✅ Marker added for @${user.username}`);
      } catch (error) {
        console.error(`  ❌ Failed to add marker for @${user.username}:`, error);
      }
    });

    console.log(`🎯 Total markers added: ${markers.current.length}`);
  }, [userLocations, mapLoaded]);

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative rounded-lg overflow-hidden">
      {!mapboxToken ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-8 text-center">
          <div className="max-w-md space-y-4">
            <div className="text-4xl mb-2">🗺️</div>
            <h3 className="text-lg font-semibold text-foreground">Mapbox Token Required</h3>
            <p className="text-sm text-muted-foreground">
              To display the interactive globe, please add your Mapbox public token.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="absolute inset-0" />
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg text-sm text-foreground z-10">
            <p className="font-semibold">🌍 Global Community</p>
            <p className="text-xs opacity-80">{userLocations.length} users worldwide • Click markers for details</p>
          </div>
        </>
      )}
    </div>
  );
}
