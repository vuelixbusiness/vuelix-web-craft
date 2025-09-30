import { useRef, useEffect, useState, createContext, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
// @ts-ignore - TrackballControls types
import { TrackballControls } from 'three-stdlib';
import { useGlobeData } from '@/hooks/useGlobeData';

const InteractionContext = createContext({ isInteracting: false });

// Continent centers for distributing user dots
const CONTINENTS = [
  { name: 'North America', lat: 45.0, lng: -100.0 },
  { name: 'South America', lat: -15.0, lng: -60.0 },
  { name: 'Europe', lat: 54.0, lng: 15.0 },
  { name: 'Africa', lat: 0.0, lng: 20.0 },
  { name: 'Asia', lat: 30.0, lng: 100.0 },
  { name: 'Oceania', lat: -25.0, lng: 140.0 },
  { name: 'Antarctica', lat: -80.0, lng: 0.0 },
];

// Generate 5 user points around each continent
function generateUserPoints() {
  const points: any[] = [];
  
  CONTINENTS.forEach(continent => {
    for (let i = 0; i < 5; i++) {
      // Add some randomness around the continent center (±15 degrees)
      const latOffset = (Math.random() - 0.5) * 30;
      const lngOffset = (Math.random() - 0.5) * 30;
      
      points.push({
        lat: continent.lat + latOffset,
        lng: continent.lng + lngOffset,
        size: 0.6 + Math.random() * 0.4, // Random size between 0.6 and 1.0
        color: '#00ffff', // Bright cyan color
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

function Globe({ isInteracting }: { isInteracting: boolean }) {
  const { scene } = useThree();
  const globeRef = useRef<any>();
  const { data: arcsData } = useGlobeData();

  useEffect(() => {
    console.log('🌍 Initializing Arcs Globe...');
    
    // Generate user points
    const userPoints = generateUserPoints();
    
    // Initialize globe with arcs and user points
    const globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .arcsData([])
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1000)
      // Configure user points
      .pointsData(userPoints)
      .pointColor('color')
      .pointAltitude(0.015)
      .pointRadius('size');

    console.log('🌍 ThreeGlobe instance created with', userPoints.length, 'user points');

    // Add globe to scene
    scene.add(globe);
    globeRef.current = globe;
    console.log('✅ Globe added to scene');

    return () => {
      console.log('🧹 Cleaning up globe');
      if (globeRef.current) {
        scene.remove(globeRef.current);
      }
    };
  }, [scene]);

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

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 300], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, Math.min(2, window.devicePixelRatio)]}
      >
        <color attach="background" args={['#1e1b3b']} />
        <Globe isInteracting={isInteracting} />
        <Controls onInteractionChange={setIsInteracting} />
      </Canvas>
    </div>
  );
}
