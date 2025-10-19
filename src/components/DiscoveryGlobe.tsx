import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
// @ts-ignore - TrackballControls types
import { TrackballControls } from 'three-stdlib';
import { useNavigate } from 'react-router-dom';
import { useGlobeData } from '@/hooks/useGlobeData';
import { useGlobeUserData } from '@/hooks/useGlobeUserData';
import { getUserTypeColor, getUserTypeIcon } from '@/utils/userTypeColors';


// Convert real user data to globe points
function generateUserLocationPoints(users: any[] = []) {
  const points = users
    .filter(user => user.latitude && user.longitude)
    .map(user => ({
      lat: user.latitude,
      lng: user.longitude,
      size: 0.8,
      color: getUserTypeColor(user.user_type),
      category: user.user_type,
      icon: getUserTypeIcon(user.user_type),
      label: `${getUserTypeIcon(user.user_type)} ${user.display_name || user.username} (@${user.username})${user.city ? ` - ${user.city}, ${user.country}` : ''}`,
      username: user.username,
      userId: user.user_id,
    }));
  
  console.log(`🌍 Generated ${points.length} user location points`);
  return points;
}

function Controls({ onInteractionChange }: { onInteractionChange: (isInteracting: boolean) => void }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<TrackballControls>();

  useEffect(() => {
    const controls = new TrackballControls(camera, gl.domElement);
    controls.minDistance = 150;
    controls.maxDistance = 450;
    controls.rotateSpeed = 2;
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
  const { scene, camera, gl } = useThree();
  const globeRef = useRef<any>();
  const pointsRef = useRef<any[]>([]);
  const raycaster = useRef(new THREE.Raycaster());
  const { data: arcsData } = useGlobeData();
  const { data: users = [] } = useGlobeUserData();

  useEffect(() => {
    console.log('🌍 Initializing User Location Globe...');
    console.log(`📍 ${users.length} users sharing their location`);
    
    // Generate user location points
    const userPoints = generateUserLocationPoints(users);
    pointsRef.current = userPoints;
    
    // Initialize globe with arcs and user location points
    const globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .arcsData([])
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1000)
      // Configure user location points
      .pointsData(userPoints)
      .pointColor('color')
      .pointAltitude(0.02)
      .pointRadius('size');

    console.log('🌍 ThreeGlobe instance created with', userPoints.length, 'user location points');

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
  }, [scene, users]);

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
