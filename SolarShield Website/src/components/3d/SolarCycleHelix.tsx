import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface SolarEvent {
  date: string;
  type: 'flare' | 'storm' | 'cme';
  magnitude: number;
  intensity: number;
}

interface SolarCycleHelixProps {
  events: SolarEvent[];
  cycleYears?: number;
  helixRadius?: number;
  helixHeight?: number;
  className?: string;
}

function HelixStructure({ events, cycleYears = 11, helixRadius = 4, helixHeight = 12 }: {
  events: SolarEvent[];
  cycleYears: number;
  helixRadius: number;
  helixHeight: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const helixRef = useRef<THREE.Mesh>(null);

  // Create helix path
  const helixCurve = useMemo(() => {
    const points = [];
    const totalPoints = 200;
    
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * Math.PI * 2 * cycleYears; // Complete cycles
      const y = t * helixHeight - helixHeight / 2;
      
      const x = Math.cos(angle) * helixRadius;
      const z = Math.sin(angle) * helixRadius;
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return new THREE.CatmullRomCurve3(points);
  }, [cycleYears, helixRadius, helixHeight]);

  // Position events on helix
  const eventPositions = useMemo(() => {
    if (!events.length) return [];
    
    const positions = [];
    const oldestDate = new Date(events[events.length - 1].date).getTime();
    const newestDate = new Date(events[0].date).getTime();
    const totalTimeSpan = newestDate - oldestDate;
    
    events.forEach(event => {
      const eventTime = new Date(event.date).getTime();
      const timeProgress = (eventTime - oldestDate) / totalTimeSpan;
      
      // Get position on helix curve
      const helixPoint = helixCurve.getPoint(timeProgress);
      
      positions.push({
        position: helixPoint,
        event,
        timeProgress
      });
    });
    
    return positions;
  }, [events, helixCurve]);

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'flare': return '#ff6b35';
      case 'storm': return '#00d4ff';
      case 'cme': return '#8338ec';
      default: return '#ffffff';
    }
  };

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.02;
    }
    if (helixRef.current && helixRef.current.material) {
      const material = helixRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.time.value = clock.elapsedTime;
      }
    }
  });

  // Helix material with animated glow
  const helixMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00d4ff') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          float wave = sin(vUv.x * 20.0 + time * 2.0) * 0.5 + 0.5;
          float opacity = 0.3 + wave * 0.4;
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Helix path */}
      <mesh ref={helixRef}>
        <primitive object={new THREE.TubeGeometry(helixCurve, 100, 0.05, 8, false)} attach="geometry" />
        <primitive object={helixMaterial} attach="material" />
      </mesh>

      {/* Solar cycle markers */}
      {Array.from({ length: cycleYears + 1 }, (_, i) => {
        const y = (i / cycleYears) * helixHeight - helixHeight / 2;
        const isMaximum = i % 11 === 5.5; // Solar maximum roughly at cycle midpoint
        
        return (
          <group key={i} position={[0, y, 0]}>
            {/* Cycle ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[helixRadius, 0.02, 8, 32]} />
              <meshBasicMaterial 
                color={isMaximum ? '#ff6b35' : '#444444'} 
                transparent 
                opacity={0.6}
              />
            </mesh>
            
            {/* Year label */}
            <Text
              position={[helixRadius + 1, 0, 0]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="left"
              anchorY="middle"
            >
              {`Cycle ${i}`}
            </Text>
          </group>
        );
      })}

      {/* Events positioned on helix */}
      {eventPositions.map(({ position, event, timeProgress }, index) => (
        <group key={index} position={position}>
          {/* Event marker */}
          <mesh>
            <sphereGeometry args={[0.05 + event.magnitude * 0.1, 8, 8]} />
            <meshPhongMaterial 
              color={getEventColor(event.type)}
              emissive={getEventColor(event.type)}
              emissiveIntensity={0.4}
            />
          </mesh>
          
          {/* Event glow */}
          <mesh>
            <sphereGeometry args={[0.15 + event.magnitude * 0.2, 16, 16]} />
            <meshBasicMaterial 
              color={getEventColor(event.type)}
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Radial line to center - simplified */}
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, position.length()]} />
            <meshBasicMaterial 
              color={getEventColor(event.type)}
              transparent
              opacity={0.2}
            />
          </mesh>

          {/* Event type label */}
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.08}
            color={getEventColor(event.type)}
            anchorX="center"
            anchorY="middle"
          >
            {event.type.charAt(0).toUpperCase()}
          </Text>
        </group>
      ))}

      {/* Central axis */}
      <mesh>
        <cylinderGeometry args={[0.01, 0.01, helixHeight]} />
        <meshBasicMaterial color="#666666" transparent opacity={0.3} />
      </mesh>

      {/* Time axis labels */}
      <Text
        position={[0, helixHeight / 2 + 1, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        PRESENT
      </Text>
      <Text
        position={[0, -helixHeight / 2 - 1, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        PAST
      </Text>
    </group>
  );
}

export default function SolarCycleHelix({ 
  events, 
  cycleYears = 11,
  helixRadius = 4,
  helixHeight = 12,
  className = ""
}: SolarCycleHelixProps) {
  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas camera={{ position: [8, 5, 8], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#ff6b35" />
        
        <HelixStructure 
          events={events}
          cycleYears={cycleYears}
          helixRadius={helixRadius}
          helixHeight={helixHeight}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.2}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>
    </div>
  );
}