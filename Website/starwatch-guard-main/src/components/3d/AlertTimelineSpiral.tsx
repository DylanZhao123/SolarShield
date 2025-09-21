import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import Legend3D from '../ui/Legend3D';

interface Alert {
  id: string;
  type: 'flare' | 'storm' | 'cme';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  time: string;
  title: string;
}

interface AlertTimelineSpiralProps {
  alerts: Alert[];
  radius?: number;
  height?: number;
  segments?: number;
  className?: string;
}

function SpiralGeometry({ alerts, radius = 5, height = 8, segments = 24 }: {
  alerts: Alert[];
  radius: number;
  height: number;
  segments: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Utilities defined before usage to avoid hoisting issues
  const getSeverityColor = (severity: string): THREE.Color => {
    switch (severity) {
      case 'critical': return new THREE.Color('#ff0040');
      case 'high': return new THREE.Color('#ff6b35');
      case 'moderate': return new THREE.Color('#f7931e');
      case 'low': return new THREE.Color('#00d4ff');
      default: return new THREE.Color('#00d4ff');
    }
  };

  const getSeverityScale = (severity: string): number => {
    switch (severity) {
      case 'critical': return 0.3;
      case 'high': return 0.25;
      case 'moderate': return 0.2;
      case 'low': return 0.15;
      default: return 0.15;
    }
  };

  const spiralPoints = useMemo(() => {
    const points = [];
    const colors = [];
    const scales = [];

    // Add fallback points if no alerts
    if (alerts.length === 0) {
      // Create a simple spiral with default points
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        const angle = t * Math.PI * 4;
        const y = height * t - height / 2;
        const x = Math.cos(angle) * radius * (1 - t * 0.3);
        const z = Math.sin(angle) * radius * (1 - t * 0.3);
        
        points.push(new THREE.Vector3(x, y, z));
        colors.push(new THREE.Color('#444444'));
        scales.push(0.1);
      }
    } else {
      alerts.forEach((alert, index) => {
        const t = index / Math.max(1, alerts.length - 1);
        const angle = t * Math.PI * 4; // 2 full rotations
        const y = height * t - height / 2;
        
        const x = Math.cos(angle) * radius * (1 - t * 0.3); // Spiral inward
        const z = Math.sin(angle) * radius * (1 - t * 0.3);

        points.push(new THREE.Vector3(x, y, z));
        
        // Color based on severity
        const color = getSeverityColor(alert.severity);
        colors.push(color);
        
        // Scale based on severity
        const scale = getSeverityScale(alert.severity);
        scales.push(scale);
      });
    }

    return { points, colors, scales };
  }, [alerts, radius, height]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  // Create spiral path line
  const spiralCurve = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(spiralPoints.points);
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [spiralPoints.points]);

  return (
    <group ref={groupRef}>
      {/* Spiral path */}
      {spiralPoints.points.length > 0 && (
        <Line
          points={spiralPoints.points.map(p => [p.x, p.y, p.z])}
          color="#00d4ff"
          transparent
          opacity={0.3}
        />
      )}
      
      {/* Alert points */}
      {alerts.length > 0 && spiralPoints.points.map((point, index) => (
        <group key={alerts[index]?.id || index} position={point}>
          {/* Alert sphere */}
          <mesh>
            <sphereGeometry args={[spiralPoints.scales[index], 16, 16]} />
            <meshPhongMaterial 
              color={spiralPoints.colors[index]}
              emissive={spiralPoints.colors[index]}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Glow effect */}
          <mesh>
            <sphereGeometry args={[spiralPoints.scales[index] * 1.5, 16, 16]} />
            <meshBasicMaterial 
              color={spiralPoints.colors[index]}
              transparent
              opacity={0.2}
            />
          </mesh>
          
          {/* Alert type indicator */}
          <Text
            position={[0, spiralPoints.scales[index] + 0.3, 0]}
            fontSize={0.15}
            color={spiralPoints.colors[index]}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="hsl(221, 100%, 4%)"
          >
            {alerts[index]?.type?.toUpperCase() || 'ALERT'}
          </Text>
        </group>
      ))}

      {/* Time markers */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + 1);
        const z = Math.sin(angle) * (radius + 1);
        const hour = i;
        
        return (
          <Text
            key={i}
            position={[x, -height / 2 - 0.5, z]}
            fontSize={0.2}
            color="hsl(194, 100%, 80%)"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="hsl(221, 100%, 4%)"
          >
            {hour.toString().padStart(2, '0')}:00
          </Text>
        );
      })}
    </group>
  );
}

export default function AlertTimelineSpiral({ 
  alerts, 
  radius = 5, 
  height = 8, 
  segments = 24,
  className = ""
}: AlertTimelineSpiralProps) {
  const legendItems = [
    { color: '#ff0040', label: 'Critical Alerts', description: 'Highest severity events' },
    { color: '#ff6b35', label: 'High Severity', description: 'Significant impact' },
    { color: '#f7931e', label: 'Moderate Alerts', description: 'Medium severity' },
    { color: '#00d4ff', label: 'Low Severity', description: 'Minor alerts' },
    { color: '#00d4ff', label: 'Spiral Path', description: 'Timeline trajectory' },
  ];

  return (
    <div className={`w-full h-96 ${className} relative`}>
      <Canvas camera={{ position: [10, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[0, 0, 0]} intensity={0.6} color="hsl(194, 100%, 50%)" />
        
        <SpiralGeometry 
          alerts={alerts}
          radius={radius}
          height={height}
          segments={segments}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>
      
      <Legend3D 
        title="Alert Timeline"
        items={legendItems}
        position="bottom-right"
        compact={true}
      />
    </div>
  );
}