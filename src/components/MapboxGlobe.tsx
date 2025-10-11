import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGlobeUserData } from '@/hooks/useGlobeUserData';
import { supabase } from '@/integrations/supabase/client';

// User categories with exact colors from Figma design
const USER_CATEGORIES = [
  { name: "Artists", color: "#0047AB", icon: "🎵" },
  { name: "Content Creators", color: "#FF3B30", icon: "🎥" },
  { name: "Producers", color: "#4DA6FF", icon: "🎹" },
  { name: "DJs", color: "#20C997", icon: "🎚️" },
  { name: "Visual Creatives", color: "#C8A2C8", icon: "🎨" },
  { name: "Fans", color: "#8A2BE2", icon: "🙌" },
  { name: "Collectives / Groups", color: "#8B6914", icon: "👥" },
  { name: "Record Labels", color: "#ADFF2F", icon: "🏢" },
  { name: "Brands", color: "#FFD700", icon: "🤝" },
  { name: "Studios (Audio + Visual)", color: "#800000", icon: "🎙️" },
  { name: "Festivals & Events", color: "#FF69B4", icon: "🎪" }
];

// Continent centers for distributing category dots globally
const CONTINENTS = [
  { name: 'North America', lat: 45.0, lng: -100.0 },
  { name: 'South America', lat: -15.0, lng: -60.0 },
  { name: 'Europe', lat: 54.0, lng: 15.0 },
  { name: 'Africa', lat: 0.0, lng: 20.0 },
  { name: 'Asia', lat: 30.0, lng: 100.0 },
  { name: 'Oceania', lat: -25.0, lng: 140.0 },
  { name: 'Antarctica', lat: -80.0, lng: 0.0 },
];

// Map real users to category points distributed across continents
function generateCategoryPoints(users: any[] = []) {
  const points: any[] = [];
  let userIndex = 0;
  
  USER_CATEGORIES.forEach(category => {
    // Generate 3-5 points per category for variety
    const numPoints = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numPoints; i++) {
      // Pick a random continent for global distribution
      const continent = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
      
      // Add randomness around the continent center (±20 degrees)
      const latOffset = (Math.random() - 0.5) * 40;
      const lngOffset = (Math.random() - 0.5) * 40;
      
      // Get the next real user (cycle through if needed)
      const user = users[userIndex % users.length];
      userIndex++;
      
      points.push({
        lat: continent.lat + latOffset,
        lng: continent.lng + lngOffset,
        color: category.color,
        category: category.name,
        icon: category.icon,
        label: user ? `${category.icon} ${user.display_name || user.username} (@${user.username})` : `${category.icon} ${category.name}`,
        username: user?.username,
        userId: user?.user_id,
      });
    }
  });
  
  return points;
}

export function MapboxGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { data: users = [] } = useGlobeUserData();
  const [isInteracting, setIsInteracting] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
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

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map with globe projection
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

      // Add category points as markers
      const categoryPoints = generateCategoryPoints(users);
      categoryPoints.forEach((point) => {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = point.color;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        el.style.cursor = 'pointer';
        el.style.boxShadow = `0 0 10px ${point.color}`;
        el.style.transition = 'transform 0.2s';
        
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([point.lng, point.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(`
                <div style="padding: 8px; background: rgba(30, 27, 59, 0.95); color: white; border-radius: 8px;">
                  <strong>${point.label}</strong><br/>
                  <span style="color: ${point.color};">${point.category}</span>
                </div>
              `)
          )
          .addTo(map.current!);
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
  }, [users, mapboxToken]);

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative rounded-lg overflow-hidden">
      {!mapboxToken ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <p className="text-muted-foreground">Loading globe...</p>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="absolute inset-0" />
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg text-sm text-foreground z-10">
            <p className="font-semibold">🌍 Interactive Globe</p>
            <p className="text-xs opacity-80">Zoom to street level • Click markers for details</p>
          </div>
        </>
      )}
    </div>
  );
}
