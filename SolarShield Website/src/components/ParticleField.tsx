import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  particleCount?: number;
  color?: string;
  speed?: number;
}

function Particles({ count = 1000, color = '#00D4FF', speed = 1 }: { count?: number; color?: string; speed?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Random positions in a sphere
      const i3 = i * 3;
      const radius = Math.random() * 10 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Varying colors
      const variation = Math.random() * 0.5 + 0.5;
      colors[i3] = colorObj.r * variation;
      colors[i3 + 1] = colorObj.g * variation;
      colors[i3 + 2] = colorObj.b * variation;
    }

    return [positions, colors];
  }, [count, color]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.elapsedTime * speed * 0.1;
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.2;
      
      // Gentle floating motion
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + i) * 0.001;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        transparent
        opacity={0.6}
        vertexColors
        sizeAttenuation
        alphaTest={0.001}
      />
    </points>
  );
}

export default function ParticleField({ particleCount = 1000, color = '#00D4FF', speed = 1 }: ParticleFieldProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Particles count={particleCount} color={color} speed={speed} />
      </Canvas>
    </div>
  );
}