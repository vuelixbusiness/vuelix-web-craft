import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import * as satellite from 'satellite.js';
// @ts-ignore - TrackballControls types
import { TrackballControls } from 'three-stdlib';

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

function Globe() {
  const globeRef = useRef<any>();
  const timeRef = useRef<Date>(new Date());
  const satDataRef = useRef<SatelliteData[]>([]);

  useEffect(() => {
    // Initialize globe
    const globe = new ThreeGlobe()
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
      .particleLat('lat')
      .particleLng('lng')
      .particleAltitude('alt')
      .particlesSize(2);

    // Load satellite icon texture
    new THREE.TextureLoader().load('/sat-icon.png', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      globe.particlesTexture(texture);
    });

    if (globeRef.current) {
      globeRef.current.add(globe);
    }

    // Load TLE data
    fetch('/space-track-leo.txt')
      .then((r) => r.text())
      .then((rawData) => {
        const tleData = rawData
          .replace(/\r/g, '')
          .split(/\n(?=[^12])/)
          .map((tle) => tle.split('\n'));
        
        const satData = tleData
          .map(([name, ...tle]) => ({
            satrec: satellite.twoline2satrec(tle[0], tle[1]),
            name: name.trim().replace(/^0 /, ''),
          }))
          // exclude those that can't be propagated
          .filter((d) => !!satellite.propagate(d.satrec, new Date())?.position);

        satDataRef.current = satData;
      });

    return () => {
      if (globeRef.current) {
        globeRef.current.remove(globe);
      }
    };
  }, []);

  useFrame(() => {
    if (!globeRef.current || satDataRef.current.length === 0) return;

    // Update time
    timeRef.current = new Date(+timeRef.current + TIME_STEP);

    // Update satellite positions
    const gmst = satellite.gstime(timeRef.current);
    satDataRef.current.forEach((d) => {
      const eci = satellite.propagate(d.satrec, timeRef.current);
      if (eci?.position) {
        const gdPos = satellite.eciToGeodetic(eci.position, gmst);
        d.lat = satellite.radiansToDegrees(gdPos.latitude);
        d.lng = satellite.radiansToDegrees(gdPos.longitude);
        d.alt = gdPos.height / EARTH_RADIUS_KM;
      } else {
        // explicitly handle invalid position
        d.lat = NaN;
        d.lng = NaN;
        d.alt = NaN;
      }
    });

    // Update globe with valid satellites
    const validSats = satDataRef.current.filter(
      (d) => !isNaN(d.lat!) && !isNaN(d.lng!) && !isNaN(d.alt!)
    );
    
    const globe = globeRef.current.children[0];
    if (globe && globe.particlesData) {
      globe.particlesData(validSats);
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
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px]">
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
