import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { getUserTypeColor, getUserTypeIcon } from '@/utils/userTypeColors';
import { Link } from 'react-router-dom';
import { List } from 'lucide-react';

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

// Validate coordinates
const isValidCoordinate = (lat: number | null | undefined, lng: number | null | undefined): boolean => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
};

export function MapboxGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const rotationInterval = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);

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
        .select('id, user_id, username, display_name, user_type, membership_type, latitude, longitude, city, country, avatar_url')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('❌ Error fetching user locations:', error);
        return;
      }

      // Validate coordinates before adding
      const validLocations = (data || []).filter(user => 
        isValidCoordinate(user.latitude, user.longitude)
      );

      console.log('✅ Fetched user locations:', validLocations.length, 'valid locations out of', data?.length || 0, 'total');
      setUserLocations(validLocations);
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
          table: 'profiles'
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
      style: 'mapbox://styles/vuelix/cmh0499yi009r01skctiecdhy',
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

    // Add atmosphere and fog effects with enhanced glow and vignette
    map.current.on('style.load', () => {
      if (!map.current) return;
      console.log('🎨 Map style loaded');
      
      // Enhanced atmosphere with stronger glow
      map.current.setFog({
        color: 'rgb(20, 18, 40)',
        'high-color': 'rgb(60, 55, 110)',
        'horizon-blend': 0.15,
        'space-color': 'rgb(10, 8, 20)',
        'star-intensity': 0.8,
      });

      // Darken oceans slightly
      if (map.current.getLayer('water')) {
        map.current.setPaintProperty('water', 'fill-color', 'rgb(15, 18, 30)');
      }
    });

    // Auto-rotation functionality with improved behavior
    const startRotation = () => {
      if (rotationInterval.current) {
        clearInterval(rotationInterval.current);
      }
      
      rotationInterval.current = setInterval(() => {
        if (!isInteracting && !popupOpen && map.current) {
          const center = map.current.getCenter();
          const zoom = map.current.getZoom();
          
          // Pause rotation when zoomed in (zoom > 3)
          if (zoom > 3) {
            return;
          }
          
          // Slower rotation speed
          const baseSpeed = 0.3;
          const zoomFactor = Math.pow(0.5, zoom - 1.2);
          const adjustedSpeed = baseSpeed * zoomFactor;
          center.lng += adjustedSpeed;
          map.current.easeTo({ center, duration: 1000, easing: (t) => t });
        }
      }, 1000);
    };

    // Handle user interaction with 7-second pause
    const handleInteractionStart = () => {
      setIsInteracting(true);
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
    };

    const handleInteractionEnd = () => {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
      
      // Resume rotation after 7 seconds of inactivity
      inactivityTimeout.current = setTimeout(() => {
        setIsInteracting(false);
        startRotation();
      }, 7000);
    };

    map.current.on('mousedown', handleInteractionStart);
    map.current.on('touchstart', handleInteractionStart);
    map.current.on('dragstart', handleInteractionStart);
    map.current.on('click', handleInteractionStart);
    
    map.current.on('mouseup', handleInteractionEnd);
    map.current.on('touchend', handleInteractionEnd);
    map.current.on('dragend', handleInteractionEnd);

    // Start rotation
    startRotation();

    return () => {
      if (rotationInterval.current) {
        clearInterval(rotationInterval.current);
      }
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add clustered markers with GeoJSON for performance
  useEffect(() => {
    if (!map.current || !mapLoaded || userLocations.length === 0) {
      console.log('⏳ Waiting for map and locations...', { 
        hasMap: !!map.current, 
        mapLoaded, 
        locationsCount: userLocations.length 
      });
      return;
    }

    console.log('📌 Adding clustered data source for', userLocations.length, 'users');

    const mapInstance = map.current;

    // Convert user locations to GeoJSON features
    const features = userLocations.map(user => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [user.longitude, user.latitude]
      },
      properties: {
        user_id: user.user_id,
        username: user.username,
        display_name: user.display_name || '',
        user_type: user.user_type,
        membership_type: user.membership_type,
        city: user.city || '',
        country: user.country || '',
        avatar_url: user.avatar_url || '',
        color: user.membership_type === 'vip' ? '#FFD700' : getUserTypeColor(user.user_type)
      }
    }));

    // Remove existing source and layers if they exist
    if (mapInstance.getLayer('clusters')) mapInstance.removeLayer('clusters');
    if (mapInstance.getLayer('cluster-count')) mapInstance.removeLayer('cluster-count');
    if (mapInstance.getLayer('unclustered-point')) mapInstance.removeLayer('unclustered-point');
    if (mapInstance.getSource('users')) mapInstance.removeSource('users');

    // Add GeoJSON source with clustering
    mapInstance.addSource('users', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add cluster circles
    mapInstance.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'users',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          'rgba(138, 43, 226, 0.7)',
          10,
          'rgba(75, 0, 130, 0.7)',
          25,
          'rgba(128, 0, 128, 0.8)'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,
          10,
          20,
          25,
          25
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(255, 255, 255, 0.6)'
      }
    });

    // Add cluster count labels
    mapInstance.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'users',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Add individual user markers (unclustered points)
    mapInstance.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'users',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(255, 255, 255, 0.8)',
        'circle-opacity': 0.85,
        'circle-blur': 0.2
      }
    });

    // Add glow effect for individual markers
    mapInstance.addLayer({
      id: 'unclustered-point-glow',
      type: 'circle',
      source: 'users',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 10,
        'circle-opacity': 0.3,
        'circle-blur': 0.8
      }
    });

    // Click handlers
    // Cluster click - zoom in
    mapInstance.on('click', 'clusters', (e) => {
      if (!e.features?.[0]) return;
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties?.cluster_id;
      if (!clusterId) return;

      const source = mapInstance.getSource('users') as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !e.lngLat) return;
        
        mapInstance.easeTo({
          center: e.lngLat,
          zoom: zoom || mapInstance.getZoom() + 2
        });
      });
    });

    // Individual marker click - show popup
    mapInstance.on('click', 'unclustered-point', (e) => {
      if (!e.features?.[0] || !e.lngLat) return;
      
      const props = e.features[0].properties;
      if (!props) return;

      // Close existing popup
      if (currentPopup.current) {
        currentPopup.current.remove();
      }

      const locationText = props.city && props.country 
        ? `${props.city}, ${props.country}`
        : props.country || 'Location set';

      const avatarUrl = props.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.username}`;
      const userLabel = props.membership_type === 'vip' ? 'VIP' : props.user_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

      const popup = new mapboxgl.Popup({ 
        offset: 15,
        closeButton: true,
        className: 'globe-popup',
        maxWidth: '300px'
      })
        .setLngLat(e.lngLat)
        .setHTML(`
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
                alt="${props.username}" 
                style="
                  width: 48px; 
                  height: 48px; 
                  border-radius: 50%; 
                  border: 2px solid ${props.color};
                  object-fit: cover;
                "
              />
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 15px; margin-bottom: 3px;">
                  @${props.username}
                </div>
                <div style="font-size: 11px; color: ${props.color}; font-weight: 500; text-transform: capitalize;">
                  ${userLabel}
                </div>
              </div>
            </div>
            <div style="font-size: 12px; color: #ddd; margin-bottom: 3px;">
              ${props.display_name || 'No display name'}
            </div>
            <div style="font-size: 11px; color: #aaa; margin-bottom: 12px;">
              📍 ${locationText}
            </div>
            <a 
              href="/user/${props.username}" 
              style="
                display: block;
                text-align: center;
                background: ${props.color};
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
        `)
        .addTo(mapInstance);

      currentPopup.current = popup;
      setPopupOpen(true);

      popup.on('close', () => {
        setPopupOpen(false);
        currentPopup.current = null;
      });
    });

    // Hover effects
    mapInstance.on('mouseenter', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = '';
    });
    mapInstance.on('mouseenter', 'unclustered-point', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'unclustered-point', () => {
      mapInstance.getCanvas().style.cursor = '';
    });

    console.log(`🎯 Clustered data source added with ${features.length} points`);

    return () => {
      if (currentPopup.current) {
        currentPopup.current.remove();
        currentPopup.current = null;
      }
    };
  }, [userLocations, mapLoaded, popupOpen]);

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative overflow-hidden">
      {/* Subtle vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />
      
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
            <p className="text-xs opacity-80">{userLocations.length} users worldwide • Click markers or clusters</p>
          </div>
          
          {/* Accessibility: List View Link */}
          <div className="absolute bottom-4 left-4 z-10">
            <Link 
              to="/discover"
              className="flex items-center gap-2 bg-background/90 backdrop-blur-sm hover:bg-background px-4 py-2 rounded-lg text-sm font-medium text-foreground transition-colors border border-border/50"
            >
              <List className="w-4 h-4" />
              View All Users
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
