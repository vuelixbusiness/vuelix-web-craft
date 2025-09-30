import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
}

function Globe() {
  const globeRef = useRef<any>();
  const [globeData, setGlobeData] = useState<GlobePoint[]>([]);

  useEffect(() => {
    // Generate random points representing campaigns/users around the world
    const points: GlobePoint[] = [];
    const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
    
    for (let i = 0; i < 300; i++) {
      points.push({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setGlobeData(points);

    // Initialize globe
    const globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .pointsData(points)
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(0.5);

    globe.scale.set(1.8, 1.8, 1.8);
    
    if (globeRef.current) {
      globeRef.current.add(globe);
    }
  }, []);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={globeRef}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4338ca" />
    </group>
  );
}

export function DiscoveryGlobe() {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px]">
      <Canvas
        camera={{ position: [0, 0, 300], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['hsl(var(--background))']} />
        <Globe />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={200}
          maxDistance={500}
          autoRotate={false}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
