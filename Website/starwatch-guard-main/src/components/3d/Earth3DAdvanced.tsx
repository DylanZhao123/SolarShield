import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, useTexture, Line } from '@react-three/drei';
import * as THREE from 'three';
import Legend3D from '../ui/Legend3D';
import { createRealisticEarthTexture } from '../../utils/earthTexture';

interface Earth3DAdvancedProps {
  className?: string;
  spaceWeatherIntensity?: number;
  impactZones?: Array<{
    latitude: number;
    longitude: number;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    type: string;
  }>;
  showMagnetosphere?: boolean;
  showAurora?: boolean;
  cmeTrajectories?: Array<{
    direction: THREE.Vector3;
    speed: number;
    intensity: number;
  }>;
}

function EarthMeshAdvanced({ 
  spaceWeatherIntensity = 0,
  impactZones = [],
  showMagnetosphere = true,
  showAurora = false,
  cmeTrajectories = []
}: Omit<Earth3DAdvancedProps, 'className'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  const auroraRef = useRef<THREE.Mesh>(null);
  const magnetosphereRef = useRef<THREE.Mesh>(null);

  // Utilities
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#ff0040';
      case 'high': return '#ff6b35';
      case 'moderate': return '#f7931e';
      case 'low': return '#00d4ff';
      default: return '#00d4ff';
    }
  };

  // Enhanced Earth texture
  const earthTexture = useMemo(() => {
    const baseTexture = createRealisticEarthTexture();
    const canvas = baseTexture.image;
    const ctx = canvas.getContext('2d')!;
    
    // Add impact zones on top of realistic Earth
    impactZones.forEach(zone => {
      const x = ((zone.longitude + 180) / 360) * canvas.width;
      const y = ((90 - zone.latitude) / 180) * canvas.height;
      
      ctx.fillStyle = getSeverityColor(zone.severity);
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
      gradient.addColorStop(0, getSeverityColor(zone.severity) + '80');
      gradient.addColorStop(1, getSeverityColor(zone.severity) + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
    
    baseTexture.needsUpdate = true;
    return baseTexture;
  }, [impactZones]);

  // Enhanced aurora material
  const auroraMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        intensity: { value: spaceWeatherIntensity },
        showAurora: { value: showAurora ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform float showAurora;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float latitude = abs(vPosition.y);
          float aurora = smoothstep(0.65, 1.0, latitude) * showAurora;
          
          float wave1 = sin(vUv.x * 15.0 + time * 3.0) * 0.5 + 0.5;
          float wave2 = sin(vUv.x * 8.0 - time * 2.0) * 0.3 + 0.7;
          float pulse = sin(time * 4.0) * 0.2 + 0.8;
          
          vec3 color1 = vec3(0.0, 1.0, 0.6); // Green
          vec3 color2 = vec3(1.0, 0.2, 0.8); // Pink
          vec3 color3 = vec3(0.2, 0.6, 1.0); // Blue
          
          vec3 color = mix(color1, color2, wave1);
          color = mix(color, color3, wave2 * 0.5);
          
          float opacity = aurora * wave1 * wave2 * pulse * intensity * 0.8;
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });
  }, [spaceWeatherIntensity, showAurora]);

  // Magnetosphere material
  const magnetosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        intensity: { value: spaceWeatherIntensity },
        show: { value: showMagnetosphere ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform float show;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          float field = sin(vPosition.x * 5.0 + time) * sin(vPosition.z * 3.0 + time * 1.5) * 0.5 + 0.5;
          
          vec3 color = vec3(0.0, 0.8, 1.0);
          float opacity = fresnel * field * intensity * 0.3 * show;
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });
  }, [spaceWeatherIntensity, showMagnetosphere]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (auroraRef.current && auroraMaterial) {
      auroraMaterial.uniforms.time.value = clock.elapsedTime;
    }
    if (magnetosphereRef.current && magnetosphereMaterial) {
      magnetosphereMaterial.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* Earth */}
      <Sphere ref={meshRef} args={[2, 64, 32]}>
        <meshPhongMaterial 
          map={earthTexture}
          emissive="#001122"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Aurora */}
      <Sphere ref={auroraRef} args={[2.1, 32, 16]}>
        <primitive object={auroraMaterial} attach="material" />
      </Sphere>
      
      {/* Magnetosphere */}
      {showMagnetosphere && (
        <mesh ref={magnetosphereRef}>
          <sphereGeometry args={[3.5, 32, 16]} />
          <primitive object={magnetosphereMaterial} attach="material" />
        </mesh>
      )}
      
      {/* Atmosphere glow */}
      <Sphere args={[2.2, 32, 16]}>
        <meshPhongMaterial
          color="#87CEEB"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* CME Trajectories */}
      {cmeTrajectories.map((cme, index) => (
        <group key={index}>
          <mesh position={cme.direction.clone().multiplyScalar(8)}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff6b35" />
          </mesh>
          <Line
            points={[[cme.direction.x * 8, cme.direction.y * 8, cme.direction.z * 8], [0, 0, 0]]}
            color="#ff6b35"
            opacity={cme.intensity}
            transparent
          />
        </group>
      ))}
    </group>
  );
}

export default function Earth3DAdvanced({ 
  className = "", 
  spaceWeatherIntensity = 0,
  impactZones = [],
  showMagnetosphere = true,
  showAurora = false,
  cmeTrajectories = []
}: Earth3DAdvancedProps) {
  const legendItems = [
    { color: '#22c55e', label: 'Earth Surface', description: 'Realistic continents & oceans' },
    { color: '#87CEEB', label: 'Atmosphere', description: 'Protective gas layer' },
    ...(showAurora ? [{ color: '#00ff99', label: 'Aurora', description: 'Polar light phenomena' }] : []),
    ...(showMagnetosphere ? [{ color: '#00d4ff', label: 'Magnetosphere', description: 'Magnetic field protection' }] : []),
    ...(cmeTrajectories.length > 0 ? [{ color: '#ff6b35', label: 'CME Trajectories', description: 'Coronal mass ejections' }] : []),
    { color: '#ff0040', label: 'Critical Impact', description: 'High severity zones' },
    { color: '#ff6b35', label: 'High Impact', description: 'Moderate-high severity' },
    { color: '#f7931e', label: 'Moderate Impact', description: 'Medium severity zones' },
    { color: '#00d4ff', label: 'Low Impact', description: 'Minor effects' },
  ];

  return (
    <div className={`w-full h-96 ${className} relative`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="hsl(0, 0%, 100%)" />
        <pointLight position={[-10, -10, -5]} intensity={0.4} color="hsl(14, 100%, 60%)" />
        
        <EarthMeshAdvanced 
          spaceWeatherIntensity={spaceWeatherIntensity}
          impactZones={impactZones}
          showMagnetosphere={showMagnetosphere}
          showAurora={showAurora}
          cmeTrajectories={cmeTrajectories}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.3}
          maxDistance={15}
          minDistance={4}
        />
      </Canvas>
      
      <Legend3D 
        title="Advanced Earth"
        items={legendItems}
        position="top-left"
        compact={true}
      />
    </div>
  );
}