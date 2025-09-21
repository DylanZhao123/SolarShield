import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import Legend3D from '../ui/Legend3D';

interface SpacetimeEvent {
  id: string;
  type: 'flare' | 'storm' | 'cme';
  intensity: number;
  duration: number;
  impactScore: number;
  date: string;
  title: string;
}

interface SpacetimeEventsProps {
  events: SpacetimeEvent[];
  xAxis?: 'intensity' | 'duration' | 'impactScore';
  yAxis?: 'intensity' | 'duration' | 'impactScore';
  zAxis?: 'intensity' | 'duration' | 'impactScore';
  timeAxis?: 'date';
  currentTime?: number;
  className?: string;
}

const getEventColor = (type: string): THREE.Color => {
  switch (type) {
    case 'flare': return new THREE.Color('#ff6b35');
    case 'storm': return new THREE.Color('#00d4ff');
    case 'cme': return new THREE.Color('#8338ec');
    default: return new THREE.Color('#ffffff');
  }
};

function EventPoints({ events, xAxis = 'intensity', yAxis = 'duration', zAxis = 'impactScore', currentTime = 0 }: {
  events: SpacetimeEvent[];
  xAxis: string;
  yAxis: string;
  zAxis: string;
  currentTime: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const eventPositions = useMemo(() => {
    const positions = [];
    const colors = [];
    const scales = [];

    // Normalize values for positioning
    const maxValues = {
      intensity: Math.max(...events.map(e => e.intensity)),
      duration: Math.max(...events.map(e => e.duration)),
      impactScore: Math.max(...events.map(e => e.impactScore))
    };

    events.forEach((event, index) => {
      const x = ((event as any)[xAxis] / (maxValues as any)[xAxis]) * 10 - 5;
      const y = ((event as any)[yAxis] / (maxValues as any)[yAxis]) * 10 - 5;
      const z = ((event as any)[zAxis] / (maxValues as any)[zAxis]) * 10 - 5;

      positions.push({ x, y, z });

      // Color based on type
      const color = getEventColor(event.type);
      colors.push(color);

      // Scale based on impact score
      const scale = 0.1 + (event.impactScore / Math.max(1, maxValues.impactScore)) * 0.3;
      scales.push(scale);
    });

    return { positions, colors, scales };
  }, [events, xAxis, yAxis, zAxis]);


  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Axis lines */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 10]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 10]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 10]} />
        <meshBasicMaterial color="#666666" />
      </mesh>

      {/* Axis labels */}
      <Text position={[5.5, 0, 0]} fontSize={0.3} color="hsl(194, 100%, 80%)" outlineWidth={0.02} outlineColor="hsl(221, 100%, 4%)">
        {xAxis}
      </Text>
      <Text position={[0, 5.5, 0]} fontSize={0.3} color="hsl(194, 100%, 80%)" outlineWidth={0.02} outlineColor="hsl(221, 100%, 4%)">
        {yAxis}
      </Text>
      <Text position={[0, 0, 5.5]} fontSize={0.3} color="hsl(194, 100%, 80%)" outlineWidth={0.02} outlineColor="hsl(221, 100%, 4%)">
        {zAxis}
      </Text>

      {/* Event points */}
      {eventPositions.positions.map((pos, index) => {
        const event = events[index];
        const eventDate = new Date(event.date).getTime();
        const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24);
        const opacity = Math.max(0.2, 1 - daysSinceEvent / 365); // Fade over a year

        return (
          <group key={event.id} position={[pos.x, pos.y, pos.z]}>
            <mesh>
              <sphereGeometry args={[eventPositions.scales[index], 8, 8]} />
              <meshPhongMaterial 
                color={eventPositions.colors[index]}
                emissive={eventPositions.colors[index]}
                emissiveIntensity={0.3}
                transparent
                opacity={opacity}
              />
            </mesh>

            {/* Temporal connection lines - removed for now */}

            {/* Event info on hover */}
            <Text
              position={[0, eventPositions.scales[index] + 0.2, 0]}
              fontSize={0.1}
              color={eventPositions.colors[index]}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="hsl(221, 100%, 4%)"
            >
              {event.type.toUpperCase()}
            </Text>
          </group>
        );
      })}

      {/* Grid planes */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.05}
          wireframe
        />
      </mesh>
    </group>
  );
}

export default function SpacetimeEvents({ 
  events, 
  xAxis = 'intensity',
  yAxis = 'duration',
  zAxis = 'impactScore',
  timeAxis = 'date',
  currentTime = 0,
  className = ""
}: SpacetimeEventsProps) {
  const legendItems = [
    { color: '#ff6b35', label: 'Solar Flares', description: 'High-energy eruptions' },
    { color: '#00d4ff', label: 'Geomagnetic Storms', description: 'Magnetic disturbances' },
    { color: '#8338ec', label: 'CME Events', description: 'Coronal mass ejections' },
    { color: '#666666', label: 'Coordinate Axes', description: `X: ${xAxis}, Y: ${yAxis}, Z: ${zAxis}` },
  ];

  return (
    <div className={`w-full h-96 ${className} relative`}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="hsl(194, 100%, 50%)" />
        
        <EventPoints 
          events={events}
          xAxis={xAxis}
          yAxis={yAxis}
          zAxis={zAxis}
          currentTime={currentTime}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          autoRotate 
          autoRotateSpeed={0.3}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>
      
      <Legend3D 
        title="Spacetime Events"
        items={legendItems}
        position="bottom-right"
        compact={true}
      />
    </div>
  );
}