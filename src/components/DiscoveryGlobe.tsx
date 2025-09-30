import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
// @ts-ignore - TrackballControls types
import { TrackballControls } from 'three-stdlib';
import { useGlobeData, type SatelliteEntity } from '@/hooks/useGlobeData';

const TIME_STEP = 0.0001; // Slow orbital rotation per frame

function Controls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<TrackballControls>();

  useEffect(() => {
    const controls = new TrackballControls(camera, gl.domElement);
    controls.minDistance = 101;
    controls.rotateSpeed = 5;
    controls.zoomSpeed = 0.8;
    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function Globe() {
  const globeRef = useRef<any>();
  const satDataRef = useRef<SatelliteEntity[]>([]);
  const { data: satellites, isLoading } = useGlobeData();

  useEffect(() => {
    // Initialize globe
    const globe = new ThreeGlobe()
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
      .particleLat('lat')
      .particleLng('lng')
      .particleAltitude('alt')
      .particlesColor('color')
      .particlesSize(8);

    // Load satellite icon texture
    new THREE.TextureLoader().load('/sat-icon.png', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      globe.particlesTexture(texture);
    });

    if (globeRef.current) {
      globeRef.current.add(globe);
    }

    return () => {
      if (globeRef.current) {
        globeRef.current.remove(globe);
      }
    };
  }, []);

  // Update satellites when data loads
  useEffect(() => {
    if (satellites && globeRef.current) {
      console.log('🌍 Setting satellites on globe:', satellites.length, satellites);
      satDataRef.current = satellites;
      const globe = globeRef.current.children[0];
      if (globe && globe.particlesData) {
        globe.particlesData(satellites);
      }
    }
  }, [satellites]);

  useFrame(() => {
    if (!globeRef.current || satDataRef.current.length === 0) return;

    // Simple orbital motion - increment longitude
    satDataRef.current.forEach((sat, i) => {
      // Each satellite orbits at slightly different speed
      const speed = TIME_STEP * (1 + i * 0.1);
      sat.lng += speed;
      
      // Wrap around at 180/-180
      if (sat.lng > 180) sat.lng = -180;
    });

    // Update globe particles
    const globe = globeRef.current.children[0];
    if (globe && globe.particlesData) {
      globe.particlesData([...satDataRef.current]);
    }
  });

  return (
    <group ref={globeRef}>
      <ambientLight intensity={Math.PI} color="#cccccc" />
      <directionalLight intensity={0.6 * Math.PI} color="#ffffff" />
    </group>
  );
}

export function DiscoveryGlobe() {
  const { isLoading, error } = useGlobeData();

  if (error) {
    console.error('🚨 Globe error:', error);
  }

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white">Loading satellites...</div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 400], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, Math.min(2, window.devicePixelRatio)]}
      >
        <color attach="background" args={['#000000']} />
        <Globe />
        <Controls />
      </Canvas>
    </div>
  );
}
