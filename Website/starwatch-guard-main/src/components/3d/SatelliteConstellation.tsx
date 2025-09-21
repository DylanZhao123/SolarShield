import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import Legend3D from '../ui/Legend3D';
import { createRealisticEarthTexture } from '../../utils/earthTexture';

interface Satellite {
  id: string;
  name: string;
  altitude: number;
  inclination: number;
  longitude: number;
  status: 'operational' | 'degraded' | 'offline';
  type: 'gps' | 'communication' | 'weather' | 'military';
}

interface SatelliteConstellationProps {
  satellites?: Satellite[];
  threatLevel?: number;
  earthRadius?: number;
  className?: string;
}

function SatelliteSwarm({ satellites, threatLevel = 0, earthRadius = 2 }: {
  satellites: Satellite[];
  threatLevel: number;
  earthRadius: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const satellitePositions = useMemo(() => {
    return satellites.map(sat => {
      const altitude = earthRadius + (sat.altitude / 1000) * 0.5; // Scale altitude
      const phi = (sat.inclination * Math.PI) / 180;
      const theta = (sat.longitude * Math.PI) / 180;
      
      return {
        position: new THREE.Vector3(
          altitude * Math.sin(phi) * Math.cos(theta),
          altitude * Math.cos(phi),
          altitude * Math.sin(phi) * Math.sin(theta)
        ),
        satellite: sat
      };
    });
  }, [satellites, earthRadius]);

  const getStatusColor = (status: string, threatLevel: number): string => {
    const threat = Math.min(1, threatLevel);
    
    switch (status) {
      case 'operational':
        return threat > 0.7 ? '#ffaa00' : threat > 0.4 ? '#88ff88' : '#00ff88';
      case 'degraded':
        return '#ff6600';
      case 'offline':
        return '#ff0044';
      default:
        return '#ffffff';
    }
  };

  const getTypeShape = (type: string): JSX.Element => {
    switch (type) {
      case 'gps':
        return <boxGeometry args={[0.1, 0.1, 0.1]} />;
      case 'communication':
        return <cylinderGeometry args={[0.05, 0.05, 0.15]} />;
      case 'weather':
        return <sphereGeometry args={[0.06, 8, 8]} />;
      case 'military':
        return <octahedronGeometry args={[0.08]} />;
      default:
        return <sphereGeometry args={[0.05, 8, 8]} />;
    }
  };

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbit rings */}
      {[400, 800, 1200, 2000].map(altitude => {
        const radius = earthRadius + (altitude / 1000) * 0.5;
        return (
          <mesh key={altitude} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.01, radius + 0.01, 64]} />
            <meshBasicMaterial color="#004488" transparent opacity={0.2} />
          </mesh>
        );
      })}
      
      {/* Satellites */}
      {satellitePositions.map(({ position, satellite }, index) => (
        <group key={satellite.id} position={position}>
          <mesh>
            {getTypeShape(satellite.type)}
            <meshPhongMaterial 
              color={getStatusColor(satellite.status, threatLevel)}
              emissive={getStatusColor(satellite.status, threatLevel)}
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Satellite glow effect */}
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial 
              color={getStatusColor(satellite.status, threatLevel)}
              transparent
              opacity={0.2}
            />
          </mesh>
          
          {/* Threat visualization */}
          {threatLevel > 0.5 && satellite.status === 'operational' && (
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial 
                color="#ff4400"
                transparent
                opacity={threatLevel * 0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          
          {/* Satellite label */}
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.06}
            color={getStatusColor(satellite.status, threatLevel)}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="hsl(221, 100%, 4%)"
          >
            {satellite.name}
          </Text>
          
          {/* Communication lines to Earth */}
          {satellite.status === 'operational' && (
            <Line
              points={[[position.x, position.y, position.z], [0, 0, 0]]}
              color={getStatusColor(satellite.status, threatLevel)}
              transparent
              opacity={0.3}
            />
          )}
        </group>
      ))}
    </group>
  );
}

function EarthCore({ radius }: { radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const earthTexture = useMemo(() => createRealisticEarthTexture(), []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      {/* Earth with realistic texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 32]} />
        <meshPhongMaterial 
          map={earthTexture}
          emissive="#001122"
          emissiveIntensity={0.05}
          shininess={30}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.05, 32, 16]} />
        <meshPhongMaterial
          color="#87CEEB"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

const defaultSatellites: Satellite[] = [
  { id: '1', name: 'GPS-1', altitude: 20200, inclination: 55, longitude: 0, status: 'operational', type: 'gps' },
  { id: '2', name: 'GPS-2', altitude: 20200, inclination: 55, longitude: 60, status: 'operational', type: 'gps' },
  { id: '3', name: 'GPS-3', altitude: 20200, inclination: 55, longitude: 120, status: 'degraded', type: 'gps' },
  { id: '4', name: 'COM-1', altitude: 35786, inclination: 0, longitude: 0, status: 'operational', type: 'communication' },
  { id: '5', name: 'COM-2', altitude: 35786, inclination: 0, longitude: 120, status: 'operational', type: 'communication' },
  { id: '6', name: 'NOAA-1', altitude: 850, inclination: 98, longitude: 0, status: 'operational', type: 'weather' },
  { id: '7', name: 'NOAA-2', altitude: 850, inclination: 98, longitude: 90, status: 'operational', type: 'weather' },
  { id: '8', name: 'MIL-1', altitude: 1200, inclination: 63, longitude: 45, status: 'offline', type: 'military' },
];

export default function SatelliteConstellation({ 
  satellites = defaultSatellites,
  threatLevel = 0,
  earthRadius = 2,
  className = ""
}: SatelliteConstellationProps) {
  const legendItems = [
    { color: '#00ff88', label: 'Operational' },
    { color: '#ff6600', label: 'Degraded' },
    { color: '#ff0044', label: 'Offline' },
    { color: '#004488', label: 'Orbits' },
    { color: '#22c55e', label: 'Earth' },
  ];

  return (
    <div className={`w-full h-96 ${className} relative`}>
      <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[0, 0, 0]} intensity={0.6} color="hsl(194, 100%, 50%)" />
        
        <EarthCore radius={earthRadius} />
        <SatelliteSwarm 
          satellites={satellites}
          threatLevel={threatLevel}
          earthRadius={earthRadius}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          autoRotate 
          autoRotateSpeed={0.2}
          maxDistance={20}
          minDistance={3}
        />
      </Canvas>
      
      <Legend3D 
        title="Satellites"
        items={legendItems}
        position="top-right"
        compact={true}
      />
    </div>
  );
}