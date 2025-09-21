import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Legend3D from './ui/Legend3D';
import { createRealisticEarthTexture } from '../utils/earthTexture';

interface Earth3DProps {
  className?: string;
  spaceWeatherIntensity?: number;
}

function EarthMesh({ spaceWeatherIntensity = 0 }: { spaceWeatherIntensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const auroraRef = useRef<THREE.Mesh>(null);

  // Create Earth texture
  const earthTexture = useMemo(() => createRealisticEarthTexture(), []);

  // Create aurora material
  const auroraMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        intensity: { value: spaceWeatherIntensity },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float latitude = abs(vPosition.y);
          float aurora = smoothstep(0.7, 1.0, latitude);
          
          float wave = sin(vUv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
          float pulse = sin(time * 3.0) * 0.3 + 0.7;
          
          vec3 color = mix(
            vec3(0.0, 1.0, 0.6), 
            vec3(1.0, 0.2, 0.8), 
            wave
          );
          
          float opacity = aurora * wave * pulse * intensity * 0.6;
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });
  }, [spaceWeatherIntensity]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
    if (auroraRef.current && auroraMaterial) {
      auroraMaterial.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* Earth */}
      <Sphere ref={meshRef} args={[1, 64, 32]}>
        <meshPhongMaterial 
          map={earthTexture} 
          emissive="#001122"
          emissiveIntensity={0.05}
          shininess={30}
        />
      </Sphere>
      
      {/* Aurora */}
      <Sphere ref={auroraRef} args={[1.05, 32, 16]} material={auroraMaterial} />
      
      {/* Atmosphere */}
      <Sphere args={[1.1, 32, 16]}>
        <meshPhongMaterial
          color="#87CEEB"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

export default function Earth3D({ className = "", spaceWeatherIntensity = 0 }: Earth3DProps) {
  const legendItems = [
    { color: '#22c55e', label: 'Earth Surface', description: 'Continents and oceans' },
    { color: '#00ff99', label: 'Aurora (Northern)', description: 'Polar light phenomena' },
    { color: '#ff0099', label: 'Aurora (Southern)', description: 'Antarctic auroras' },
    { color: '#87CEEB', label: 'Atmosphere', description: 'Protective gas layer' },
  ];

  return (
    <div className={`w-full h-64 ${className} relative`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <EarthMesh spaceWeatherIntensity={spaceWeatherIntensity} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      <Legend3D 
        title="Earth 3D"
        items={legendItems}
        position="bottom-left"
        compact={true}
      />
    </div>
  );
}