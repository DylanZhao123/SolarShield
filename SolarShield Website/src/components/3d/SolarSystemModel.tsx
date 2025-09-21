import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import Legend3D from '../ui/Legend3D';
import { createRealisticEarthTexture } from '../../utils/earthTexture';

interface SolarFlareData {
  intensity: number;
  direction: THREE.Vector3;
  duration: number;
}

interface SolarSystemModelProps {
  className?: string;
  solarFlares?: SolarFlareData[];
  solarWindSpeed?: number;
  showMagnetosphere?: boolean;
  showSolarWind?: boolean;
}

function Sun({ solarFlares = [], solarWindSpeed = 400 }: {
  solarFlares: SolarFlareData[];
  solarWindSpeed: number;
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const flareGroupRef = useRef<THREE.Group>(null);

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        activity: { value: Math.min(1, solarFlares.length / 5) },
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
        uniform float activity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float noise1 = sin(vPosition.x * 10.0 + time * 2.0) * 0.5 + 0.5;
          float noise2 = sin(vPosition.y * 8.0 + time * 3.0) * 0.3 + 0.7;
          float turbulence = noise1 * noise2;
          
          vec3 baseColor = vec3(1.0, 0.6, 0.0);
          vec3 hotColor = vec3(1.0, 0.3, 0.1);
          vec3 color = mix(baseColor, hotColor, turbulence * activity);
          
          float intensity = 0.8 + turbulence * 0.4 + activity * 0.3;
          gl_FragColor = vec4(color * intensity, 1.0);
        }
      `,
    });
  }, [solarFlares.length]);

  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        activity: { value: Math.min(1, solarFlares.length / 5) },
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
        uniform float activity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          float plasma = sin(vPosition.x * 5.0 + time) * sin(vPosition.z * 3.0 + time * 1.5) * 0.5 + 0.5;
          
          vec3 color = vec3(1.0, 0.4, 0.1);
          float opacity = fresnel * plasma * (0.3 + activity * 0.4);
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });
  }, [solarFlares.length]);

  useFrame(({ clock }) => {
    if (sunRef.current && sunMaterial) {
      sunRef.current.rotation.y += 0.01;
      sunMaterial.uniforms.time.value = clock.elapsedTime;
    }
    if (coronaRef.current && coronaMaterial) {
      coronaMaterial.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <group position={[-15, 0, 0]}>
      {/* Sun core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <primitive object={sunMaterial} attach="material" />
      </mesh>
      
      {/* Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <primitive object={coronaMaterial} attach="material" />
      </mesh>
      
      {/* Solar flares */}
      <group ref={flareGroupRef}>
        {solarFlares.map((flare, index) => (
          <group key={index}>
            <mesh position={flare.direction.clone().multiplyScalar(4)}>
              <sphereGeometry args={[0.2 * flare.intensity, 8, 8]} />
              <meshBasicMaterial color="#ff4400" />
            </mesh>
            <Line
              points={Array.from({ length: 10 }, (_, i) => {
                const t = i / 9;
                const pos = flare.direction.clone().multiplyScalar(3 + t * 8);
                return [pos.x, pos.y, pos.z];
              })}
              color="#ff6600"
              opacity={flare.intensity}
              transparent
            />
          </group>
        ))}
      </group>
      
      <Text
        position={[0, -5, 0]}
        fontSize={0.5}
        color="hsl(39, 100%, 70%)"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="hsl(221, 100%, 4%)"
      >
        SUN
      </Text>
    </group>
  );
}

function Earth({ showMagnetosphere = true }: { showMagnetosphere: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const magnetosphereRef = useRef<THREE.Mesh>(null);
  
  const earthTexture = useMemo(() => createRealisticEarthTexture(), []);

  const magnetosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
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
        uniform float show;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          float field = sin(vPosition.x * 3.0 + time) * sin(vPosition.z * 2.0 + time * 0.8) * 0.5 + 0.5;
          
          vec3 color = vec3(0.0, 0.8, 1.0);
          float opacity = fresnel * field * 0.4 * show;
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });
  }, [showMagnetosphere]);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.005;
    }
    if (magnetosphereRef.current && magnetosphereMaterial) {
      magnetosphereMaterial.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <group position={[15, 0, 0]}>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial 
          map={earthTexture}
          emissive="#001122" 
          emissiveIntensity={0.05}
          shininess={30}
        />
      </mesh>
      
      {/* Magnetosphere */}
      {showMagnetosphere && (
        <mesh ref={magnetosphereRef}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <primitive object={magnetosphereMaterial} attach="material" />
        </mesh>
      )}
      
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshPhongMaterial
          color="#87CEEB"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="hsl(194, 100%, 70%)"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="hsl(221, 100%, 4%)"
      >
        EARTH
      </Text>
    </group>
  );
}

function SolarWind({ speed = 400, show = true }: { speed: number; show: boolean }) {
  const particleRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = show ? 1000 : 0;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60 - 15; // Start from sun
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      // Color based on speed
      const intensity = Math.min(1, speed / 1000);
      colors[i * 3] = 1; // Red
      colors[i * 3 + 1] = 1 - intensity * 0.5; // Green
      colors[i * 3 + 2] = 0.2; // Blue
    }
    
    return { positions, colors, count };
  }, [speed, show]);

  useFrame((state, delta) => {
    if (particleRef.current && show) {
      const positions = particleRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += delta * speed * 0.01; // Move towards Earth
        
        // Reset particles that passed Earth
        if (positions[i] > 20) {
          positions[i] = -20;
          positions[i + 1] = (Math.random() - 0.5) * 20;
          positions[i + 2] = (Math.random() - 0.5) * 20;
        }
      }
      
      particleRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particleRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.6} />
    </points>
  );
}

const defaultFlares: SolarFlareData[] = [
  { intensity: 0.8, direction: new THREE.Vector3(1, 0.2, 0.1).normalize(), duration: 1000 },
  { intensity: 0.6, direction: new THREE.Vector3(0.8, -0.3, 0.5).normalize(), duration: 800 },
];

export default function SolarSystemModel({ 
  className = "",
  solarFlares = defaultFlares,
  solarWindSpeed = 400,
  showMagnetosphere = true,
  showSolarWind = true
}: SolarSystemModelProps) {
  const legendItems = [
    { color: '#ff6600', label: 'Sun', description: 'Solar surface and corona' },
    { color: '#22c55e', label: 'Earth', description: 'Realistic surface features' },
    { color: '#00d4ff', label: 'Magnetosphere', description: 'Protective magnetic field' },
    { color: '#ff4400', label: 'Solar Flares', description: 'High-energy eruptions' },
    { color: '#ffaa44', label: 'Solar Wind', description: `Speed: ${solarWindSpeed} km/s` },
  ];

  return (
    <div className={`w-full h-96 ${className} relative`}>
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
        <ambientLight intensity={0.15} />
        <directionalLight position={[0, 10, 10]} intensity={1.2} />
        <pointLight position={[-15, 0, 0]} intensity={2} color="hsl(39, 100%, 60%)" />
        
        <Sun solarFlares={solarFlares} solarWindSpeed={solarWindSpeed} />
        <Earth showMagnetosphere={showMagnetosphere} />
        <SolarWind speed={solarWindSpeed} show={showSolarWind} />
        
        {/* Connection line */}
        <Line
          points={[[-15, 0, 0], [15, 0, 0]]}
          color="hsl(213, 31%, 51%)"
          opacity={0.4}
          transparent
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          autoRotate 
          autoRotateSpeed={0.1}
          maxDistance={40}
          minDistance={10}
        />
      </Canvas>
      
      <Legend3D 
        title="Solar System"
        items={legendItems}
        position="top-right"
        compact={true}
      />
    </div>
  );
}