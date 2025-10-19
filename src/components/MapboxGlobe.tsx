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
}

export function MapboxGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const rotationInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Failed to fetch Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  // Fetch user locations from database
  useEffect(() => {
    const fetchUserLocations = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, user_type, membership_type, latitude, longitude, city, country')
        .eq('share_location_on_globe', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching user locations:', error);
        return;
      }

      console.log('📍 Fetched user locations:', data?.length || 0);
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

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      if (!map.current) return;
      
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
    if (!map.current || userLocations.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for each user
    userLocations.forEach((user) => {
      if (!map.current) return;

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
        el.style.transform = 'scale(1.8)';
        el.style.boxShadow = `0 0 20px ${markerColor}`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = `0 0 8px ${markerColor}`;
      });

      // Create popup with user info
      const locationText = user.city && user.country 
        ? `${user.city}, ${user.country}`
        : user.country || 'Location set';

      const popup = new mapboxgl.Popup({ 
        offset: 15,
        closeButton: false,
        className: 'globe-popup'
      }).setHTML(`
        <div style="padding: 10px; font-family: system-ui; color: #fff; background: rgba(30, 27, 59, 0.95); border-radius: 8px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">
            ${userIcon} @${user.username}
          </div>
          <div style="font-size: 12px; color: #ddd; margin-bottom: 2px;">
            ${user.display_name || 'No display name'}
          </div>
          <div style="font-size: 11px; color: #aaa;">
            📍 ${locationText}
          </div>
          <div style="font-size: 10px; color: ${markerColor}; margin-top: 4px;">
            ${userLabel}
          </div>
        </div>
      `);

      // Create and add marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([user.longitude, user.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [userLocations]);

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
