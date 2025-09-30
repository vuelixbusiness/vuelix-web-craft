import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
// @ts-ignore - TrackballControls types
import { TrackballControls } from 'three-stdlib';
import { useGlobeData } from '@/hooks/useGlobeData';

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
  const { scene } = useThree();
  const globeRef = useRef<any>();
  const { data: arcsData } = useGlobeData();

  useEffect(() => {
    console.log('🌍 Initializing Arcs Globe...');
    
    // Initialize globe with arcs
    const globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .arcsData([])
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1000);

    console.log('🌍 ThreeGlobe instance created');

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

  return (
    <>
      <ambientLight intensity={Math.PI} color="#cccccc" />
      <directionalLight intensity={0.6 * Math.PI} color="#ffffff" position={[5, 3, 5]} />
    </>
  );
}

export function DiscoveryGlobe() {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative">
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
