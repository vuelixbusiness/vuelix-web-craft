import { useRef, useEffect, useState, createContext, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
// @ts-ignore - TrackballControls types
import { TrackballControls } from 'three-stdlib';
import { useNavigate } from 'react-router-dom';
import { useGlobeData } from '@/hooks/useGlobeData';
import { useGlobeUserData } from '@/hooks/useGlobeUserData';

const InteractionContext = createContext({ isInteracting: false });

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
        size: 0.7 + Math.random() * 0.5, // Random size between 0.7 and 1.2
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

function Controls({ onInteractionChange }: { onInteractionChange: (isInteracting: boolean) => void }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<TrackballControls>();

  useEffect(() => {
    const controls = new TrackballControls(camera, gl.domElement);
    controls.minDistance = 101;
    controls.rotateSpeed = 5;
    controls.zoomSpeed = 0.8;
    controlsRef.current = controls;

    const handleStart = () => onInteractionChange(true);
    const handleEnd = () => onInteractionChange(false);

    gl.domElement.addEventListener('mousedown', handleStart);
    gl.domElement.addEventListener('mouseup', handleEnd);
    gl.domElement.addEventListener('touchstart', handleStart);
    gl.domElement.addEventListener('touchend', handleEnd);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleStart);
      gl.domElement.removeEventListener('mouseup', handleEnd);
      gl.domElement.removeEventListener('touchstart', handleStart);
      gl.domElement.removeEventListener('touchend', handleEnd);
      controls.dispose();
    };
  }, [camera, gl, onInteractionChange]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function Globe({ isInteracting, onPointClick }: { isInteracting: boolean; onPointClick: (point: any) => void }) {
  const { scene, camera, gl } = useThree();
  const globeRef = useRef<any>();
  const pointsRef = useRef<any[]>([]);
  const raycaster = useRef(new THREE.Raycaster());
  const { data: arcsData } = useGlobeData();
  const { data: users = [] } = useGlobeUserData();

  useEffect(() => {
    console.log('🌍 Initializing Category-Based Globe...');
    
    // Generate category points with real user data
    const categoryPoints = generateCategoryPoints(users);
    pointsRef.current = categoryPoints;
    
    // Initialize globe with arcs and category points
    const globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .arcsData([])
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1000)
      // Configure category points
      .pointsData(categoryPoints)
      .pointColor('color')
      .pointAltitude(0.02)
      .pointRadius('size');

    console.log('🌍 ThreeGlobe instance created with', categoryPoints.length, 'category points');

    // Add globe to scene
    scene.add(globe);
    globeRef.current = globe;
    console.log('✅ Globe added to scene');

    // Handle clicks on points
    const handleClick = (event: MouseEvent) => {
      if (!globeRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse, camera);
      const intersects = raycaster.current.intersectObjects(globeRef.current.children, true);

      if (intersects.length > 0) {
        // Find the closest point to the intersection
        const intersectPoint = intersects[0].point;
        let closestPoint = null;
        let minDistance = Infinity;

        pointsRef.current.forEach(point => {
          if (!point.username) return;
          
          // Convert lat/lng to 3D coordinates
          const phi = (90 - point.lat) * (Math.PI / 180);
          const theta = (point.lng + 180) * (Math.PI / 180);
          const radius = 100 + 2; // Globe radius + point altitude
          
          const x = -(radius * Math.sin(phi) * Math.cos(theta));
          const y = radius * Math.cos(phi);
          const z = radius * Math.sin(phi) * Math.sin(theta);
          
          const distance = intersectPoint.distanceTo(new THREE.Vector3(x, y, z));
          
          if (distance < minDistance && distance < 10) { // Within 10 units
            minDistance = distance;
            closestPoint = point;
          }
        });

        if (closestPoint) {
          onPointClick(closestPoint);
        }
      }
    };

    gl.domElement.addEventListener('click', handleClick);

    return () => {
      console.log('🧹 Cleaning up globe');
      gl.domElement.removeEventListener('click', handleClick);
      if (globeRef.current) {
        scene.remove(globeRef.current);
      }
    };
  }, [scene, users, onPointClick, camera, gl]);

  // Update arcs when data changes
  useEffect(() => {
    if (globeRef.current && arcsData) {
      console.log('🎨 Updating arcs data:', arcsData.length);
      globeRef.current.arcsData(arcsData);
    }
  }, [arcsData]);

  // Rotate globe continuously when not interacting
  useFrame(() => {
    if (globeRef.current && !isInteracting) {
      globeRef.current.rotation.y += 0.003;
    }
  });

  return (
    <>
      <ambientLight intensity={Math.PI * 1.5} color="#f0f8ff" />
      <directionalLight intensity={Math.PI * 1.2} color="#ffffff" position={[10, 5, 5]} />
      <directionalLight intensity={Math.PI * 0.3} color="#ffffff" position={[-5, -3, -5]} />
    </>
  );
}

export function DiscoveryGlobe() {
  const [isInteracting, setIsInteracting] = useState(false);
  const navigate = useNavigate();

  const handlePointClick = (point: any) => {
    if (point.username) {
      navigate(`/user/${point.username}`);
    }
  };

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 300], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, Math.min(2, window.devicePixelRatio)]}
      >
        <color attach="background" args={['#1e1b3b']} />
        <Globe isInteracting={isInteracting} onPointClick={handlePointClick} />
        <Controls onInteractionChange={setIsInteracting} />
      </Canvas>
    </div>
  );
}
