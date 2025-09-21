import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import Legend3D from '../ui/Legend3D';
import { createRealisticEarthTexture } from '../../utils/earthTexture';

interface RiskData {
  latitude: number;
  longitude: number;
  sector: 'satellites' | 'power' | 'aviation' | 'gps';
  riskLevel: number; // 0-1
  name: string;
}

interface InfrastructureRiskHeatmapProps {
  riskData: RiskData[];
  currentThreatLevel?: number;
  selectedSector?: string;
  className?: string;
}

function RiskEarth({ riskData, currentThreatLevel = 0, selectedSector }: {
  riskData: RiskData[];
  currentThreatLevel: number;
  selectedSector?: string;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const earthTexture = useMemo(() => createRealisticEarthTexture(), []);
  
  const earthRadius = 2;
  
  // Convert lat/lng to 3D coordinates on sphere
  const latLngToSphere = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Calculate distance between two lat/lng points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
  };

  // Calculate surface normal and tangent rotation for text alignment
  function getSurfaceRotation(lat: number, lng: number) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    // Surface normal vector at this location
    const normal = new THREE.Vector3(
      -Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    
    // Create rotation to align text with surface
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
    
    return quaternion;
  }

  // Get optimal text positioning to avoid overlaps
  const getTextPosition = (currentRisk: RiskData, index: number, allRisks: RiskData[]) => {
    const baseHeight = 0.5 + currentRisk.riskLevel * 0.4;
    let offsetAngle = 0;
    let heightMultiplier = 1;
    
    // Check for nearby locations that might cause overlap
    const nearbyLocations = allRisks.filter((risk, i) => {
      if (i === index || (selectedSector && risk.sector !== selectedSector)) return false;
      const distance = calculateDistance(
        currentRisk.latitude, currentRisk.longitude,
        risk.latitude, risk.longitude
      );
      return distance < 15; // Within 15 degrees
    });

    // Adjust positioning based on nearby locations
    if (nearbyLocations.length > 0) {
      // For locations like Anchorage/Fairbanks, use radial offset
      offsetAngle = (index % 4) * (Math.PI / 2); // 90-degree intervals
      heightMultiplier = 1 + (index % 3) * 0.3; // Stagger heights
      
      // Special handling for very close locations (Alaska region)
      if (nearbyLocations.some(loc => 
        calculateDistance(currentRisk.latitude, currentRisk.longitude, loc.latitude, loc.longitude) < 8
      )) {
        offsetAngle = index * (Math.PI / 3); // 60-degree intervals
        heightMultiplier = 1 + (index % 2) * 0.5;
      }
    }

    const radialOffset = 0.3;
    const x = Math.cos(offsetAngle) * radialOffset;
    const y = Math.sin(offsetAngle) * radialOffset;
    const z = baseHeight * heightMultiplier;

    return { x, y, z, offsetAngle };
  };

  const getSectorColor = (sector: string): string => {
    switch (sector) {
      case 'satellites': return '#00d4ff';
      case 'power': return '#ff6b35';
      case 'aviation': return '#8338ec';
      case 'gps': return '#39ff14';
      default: return '#ffffff';
    }
  };

  const getSectorIcon = (sector: string): string => {
    switch (sector) {
      case 'satellites': return '🛰️';
      case 'power': return '⚡';
      case 'aviation': return '✈️';
      case 'gps': return '📡';
      default: return '🏢';
    }
  };

  const getRiskColor = (riskLevel: number): string => {
    if (riskLevel > 0.8) return '#ff0040';
    if (riskLevel > 0.6) return '#ff6b35';
    if (riskLevel > 0.4) return '#f7931e';
    return '#00d4ff';
  };

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.003;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[earthRadius, 64, 32]} />
        <meshPhongMaterial 
          map={earthTexture}
          emissive="#001122"
          emissiveIntensity={0.05}
          shininess={30}
        />
      </mesh>
      
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[earthRadius * 1.02, 32, 16]} />
        <meshPhongMaterial
          color="#87CEEB"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Risk zones on Earth surface */}
      {riskData.map((risk, index) => {
        if (selectedSector && risk.sector !== selectedSector) return null;
        
        const position = latLngToSphere(risk.latitude, risk.longitude, earthRadius + 0.05);
        const pulseScale = 1 + Math.sin(Date.now() * 0.003 + index) * 0.2;
        const textPos = getTextPosition(risk, index, riskData);
        const surfaceRotation = getSurfaceRotation(risk.latitude, risk.longitude);
        
        return (
          <group key={index} position={position}>
            {/* Risk zone marker */}
            <mesh>
              <sphereGeometry args={[0.08 * (0.5 + risk.riskLevel), 16, 16]} />
              <meshPhongMaterial 
                color={getRiskColor(risk.riskLevel)}
                emissive={getRiskColor(risk.riskLevel)}
                emissiveIntensity={0.4 + risk.riskLevel * 0.3}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Pulsing glow for high risk areas */}
            {risk.riskLevel > 0.6 && (
              <mesh scale={pulseScale}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial 
                  color={getRiskColor(risk.riskLevel)}
                  transparent
                  opacity={0.2 * risk.riskLevel}
                />
              </mesh>
            )}
            
            {/* Sector indicator */}
            <mesh position={[0, 0, 0.1]}>
              <cylinderGeometry args={[0.02, 0.02, 0.05]} />
              <meshPhongMaterial 
                color={getSectorColor(risk.sector)}
                emissive={getSectorColor(risk.sector)}
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Risk level indicator beam */}
            <mesh position={[0, 0, 0.15 + risk.riskLevel * 0.2]}>
              <cylinderGeometry args={[0.01, 0.01, risk.riskLevel * 0.4]} />
              <meshBasicMaterial 
                color={getRiskColor(risk.riskLevel)}
                transparent
                opacity={0.7}
              />
            </mesh>
            
            {/* Connection line to offset text */}
            {(textPos.x !== 0 || textPos.y !== 0) && (
              <mesh position={[textPos.x / 2, textPos.y / 2, textPos.z / 2]}>
                <cylinderGeometry args={[0.005, 0.005, textPos.z * 0.8]} />
                <meshBasicMaterial 
                  color="hsl(0, 0%, 70%)"
                  transparent
                  opacity={0.4}
                />
              </mesh>
            )}
            
            {/* Location label with surface alignment */}
            <group position={[textPos.x, textPos.y, textPos.z]} quaternion={surfaceRotation}>
              <Text
                position={[0, 0, 0]}
                fontSize={0.1}
                color="hsl(0, 0%, 100%)"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="hsl(221, 100%, 4%)"
              >
                {risk.name}
              </Text>
            </group>
            
            {/* Sector indicator icon with surface alignment */}
            <group position={[textPos.x * 0.7, textPos.y * 0.7, textPos.z * 0.8]} quaternion={surfaceRotation}>
              <Text
                position={[0, 0, 0]}
                fontSize={0.07}
                color={getSectorColor(risk.sector)}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="hsl(221, 100%, 4%)"
              >
                {getSectorIcon(risk.sector)}
              </Text>
            </group>
          </group>
        );
      })}
      
      {/* Threat level visualization around Earth */}
      {currentThreatLevel > 0.5 && (
        <mesh>
          <sphereGeometry args={[earthRadius * 1.1, 32, 16]} />
          <meshBasicMaterial 
            color="#ff4400"
            transparent
            opacity={currentThreatLevel * 0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

const defaultRiskData: RiskData[] = [
  { latitude: 60.2, longitude: -149.9, sector: 'power', riskLevel: 0.9, name: 'Anchorage' },
  { latitude: 64.8, longitude: -147.7, sector: 'satellites', riskLevel: 0.85, name: 'Fairbanks' },
  { latitude: 40.7, longitude: -74.0, sector: 'power', riskLevel: 0.6, name: 'NYC Grid' },
  { latitude: 51.5, longitude: -0.1, sector: 'aviation', riskLevel: 0.7, name: 'Heathrow' },
  { latitude: 35.7, longitude: 139.7, sector: 'gps', riskLevel: 0.5, name: 'Tokyo GPS' },
  { latitude: 37.4, longitude: -122.1, sector: 'satellites', riskLevel: 0.4, name: 'Silicon Valley' },
  { latitude: -33.9, longitude: 151.2, sector: 'power', riskLevel: 0.3, name: 'Sydney' },
  { latitude: 55.8, longitude: 37.6, sector: 'aviation', riskLevel: 0.8, name: 'Moscow' },
  { latitude: 25.8, longitude: -80.3, sector: 'aviation', riskLevel: 0.6, name: 'Miami Intl' },
  { latitude: 52.5, longitude: 13.4, sector: 'gps', riskLevel: 0.4, name: 'Berlin GPS' }
];

export default function InfrastructureRiskHeatmap({ 
  riskData = defaultRiskData,
  currentThreatLevel = 0,
  selectedSector,
  className = ""
}: InfrastructureRiskHeatmapProps) {
  const legendItems = [
    { color: '#22c55e', label: 'Earth Surface' },
    { color: '#ff0040', label: 'Critical Risk' },
    { color: '#ff6b35', label: 'High Risk' },
    { color: '#f7931e', label: 'Medium Risk' },
    { color: '#00d4ff', label: 'Low Risk' },
    { color: '#00d4ff', label: 'Satellites' },
    { color: '#ff6b35', label: 'Power Grid' },
    { color: '#8338ec', label: 'Aviation' },
    { color: '#39ff14', label: 'GPS Systems' }
  ];

  return (
    <div className={`w-full h-96 ${className} relative`}>
      <Canvas camera={{ position: [4, 2, 4], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[0, 0, 0]} intensity={0.8} color="hsl(194, 100%, 50%)" />
        
        <RiskEarth 
          riskData={riskData}
          currentThreatLevel={currentThreatLevel}
          selectedSector={selectedSector}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          autoRotate 
          autoRotateSpeed={0.2}
          maxDistance={10}
          minDistance={4}
        />
      </Canvas>
      
      <Legend3D 
        title="Risk Assessment"
        items={legendItems}
        position="bottom-left"
        compact={true}
      />
    </div>
  );
}