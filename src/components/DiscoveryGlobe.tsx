import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
// @ts-ignore - TrackballControls types
import { TrackballControls } from 'three-stdlib';
// @ts-ignore - satellite.js types
import * as satellite from 'satellite.js';

const EARTH_RADIUS_KM = 6371; // km
const TIME_STEP = 1.5 * 1000; // per frame

interface SatelliteData {
  satrec: any;
  name: string;
  lat?: number;
  lng?: number;
  alt?: number;
}

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

function Globe({ time }: { time: Date }) {
  const globeRef = useRef<any>();
  const satDataRef = useRef<SatelliteData[]>([]);

  useEffect(() => {
    // Initialize globe with larger particles and bright color
    const globe = new ThreeGlobe()
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
      .particleLat('lat')
      .particleLng('lng')
      .particleAltitude('alt')
      .particleColor(() => '#00ff00')  // Bright green fallback
      .particlesSize(12);  // Much larger for visibility

    // Load satellite icon texture with error handling
    new THREE.TextureLoader().load(
      '/sat-icon.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        globe.particlesTexture(texture);
        console.log('✅ Satellite texture loaded successfully');
      },
      undefined,
      (error) => {
        console.warn('⚠️ Satellite texture failed to load, using color fallback:', error);
      }
    );

    if (globeRef.current) {
      globeRef.current.add(globe);
    }

    // Load fresh TLE data from CelesTrak
    console.log('📡 Fetching TLE data from CelesTrak...');
    fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle')
      .then(r => r.text())
      .then(rawData => {
        console.log('📦 Raw TLE data received, length:', rawData.length);
        const tleData = rawData.replace(/\r/g, '').split(/\n(?=[^12])/).map(tle => tle.split('\n'));
        console.log('📋 TLE entries parsed:', tleData.length);
        
        const satData = tleData
          .map(([name, tle1, tle2]) => {
            if (!name || !tle1 || !tle2) return null;
            return {
              satrec: satellite.twoline2satrec(tle1, tle2),
              name: name.trim().replace(/^0 /, '')
            };
          })
          .filter(d => d && !!satellite.propagate(d.satrec, new Date())?.position)
          .slice(0, 100);  // Limit to first 100 for better performance

        satDataRef.current = satData;
        console.log('🛰️ Satellites loaded and ready:', satData.length);
        console.log('📍 Sample satellite:', satData[0]?.name);
      })
      .catch(err => console.error('❌ Error loading TLE data from CelesTrak:', err));

    return () => {
      if (globeRef.current) {
        globeRef.current.remove(globe);
      }
    };
  }, []);

  useFrame(() => {
    if (!globeRef.current || satDataRef.current.length === 0) return;

    // Update satellite positions based on time
    const gmst = satellite.gstime(time);
    satDataRef.current.forEach(d => {
      const eci = satellite.propagate(d.satrec, time);
      if (eci?.position) {
        const gdPos = satellite.eciToGeodetic(eci.position, gmst);
        d.lat = satellite.radiansToDegrees(gdPos.latitude);
        d.lng = satellite.radiansToDegrees(gdPos.longitude);
        // Scale altitude to be more visible (min 0.01, scale up by 5%)
        d.alt = 0.01 + (gdPos.height / EARTH_RADIUS_KM) * 0.05;
      }
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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => new Date(+prevTime + TIME_STEP));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative">
      <div className="absolute bottom-4 right-4 z-10 text-xs font-mono bg-background/10 text-foreground/60 px-2 py-1 rounded backdrop-blur-sm">
        {time.toUTCString()}
      </div>
      <Canvas
        camera={{ position: [0, 0, 400], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, Math.min(2, window.devicePixelRatio)]}
      >
        <color attach="background" args={['#000000']} />
        <Globe time={time} />
        <Controls />
      </Canvas>
    </div>
  );
}
