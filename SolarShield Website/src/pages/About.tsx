import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, Users, ExternalLink, Mail, BookOpen } from 'lucide-react';
import GlowingCard from '@/components/GlowingCard';
import ParticleField from '@/components/ParticleField';
import SolarSystemModel from '@/components/3d/SolarSystemModel';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import nasaLogo from '@/assets/nasa-logo.png';

const solarFlareData = [
  { intensity: 0.8, direction: { x: 1, y: 0.2, z: 0.1 }, duration: 1000 },
  { intensity: 0.6, direction: { x: 0.8, y: -0.3, z: 0.5 }, duration: 800 },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-space p-6">
      <ParticleField />
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-solar rounded-2xl shadow-glow-primary">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-aurora bg-clip-text text-transparent font-orbitron mb-4">
            About SolarShield
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional space weather monitoring and alert system protecting critical infrastructure 
            from solar events using real-time NASA data.
          </p>
        </motion.div>

        {/* Interactive Solar System Model */}
        <GlowingCard glowColor="primary" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-neon font-orbitron">Interactive Sun-Earth System</CardTitle>
            <CardDescription>
              Educational 3D model showing solar wind interactions and space weather phenomena
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SolarSystemModel 
              solarFlares={solarFlareData.map(flare => ({
                intensity: flare.intensity,
                direction: new THREE.Vector3(flare.direction.x, flare.direction.y, flare.direction.z),
                duration: flare.duration
              }))}
              solarWindSpeed={450}
              showMagnetosphere={true}
              showSolarWind={true}
            />
          </CardContent>
        </GlowingCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission & Statistics */}
          <GlowingCard>
            <CardHeader>
              <CardTitle className="font-orbitron">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                SolarShield addresses the growing threat of space weather to our technological infrastructure. 
                With over $10 billion in annual damages caused by solar events, early warning systems are 
                crucial for protecting satellites, power grids, aviation, and communication networks.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-primary counter-animate">$10B+</div>
                  <div className="text-sm text-muted-foreground">Annual damage from space weather</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-secondary counter-animate">40</div>
                  <div className="text-sm text-muted-foreground">Starlink satellites lost in 2022</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-success counter-animate">6M</div>
                  <div className="text-sm text-muted-foreground">People affected by 1989 blackout</div>
                </div>
              </div>
            </CardContent>
          </GlowingCard>

          {/* Understanding Space Weather */}
          <GlowingCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <BookOpen className="w-6 h-6 text-primary" />
                Understanding Space Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge className="mb-2" variant="outline">Solar Flares</Badge>
                  <p className="text-sm text-muted-foreground">
                    Intense bursts of radiation from the Sun's surface that can disrupt radio communications 
                    and satellite operations. Classified from A (weakest) to X (strongest).
                  </p>
                </div>
                <div>
                  <Badge className="mb-2" variant="outline">Coronal Mass Ejections</Badge>
                  <p className="text-sm text-muted-foreground">
                    Massive clouds of solar plasma that can cause geomagnetic storms when they interact 
                    with Earth's magnetic field, affecting power grids and navigation systems.
                  </p>
                </div>
                <div>
                  <Badge className="mb-2" variant="outline">Geomagnetic Storms</Badge>
                  <p className="text-sm text-muted-foreground">
                    Disturbances in Earth's magnetic field caused by solar wind, measured by the Kp index 
                    from 0-9. Storms rated G1 (minor) to G5 (extreme) can disrupt technology.
                  </p>
                </div>
              </div>
            </CardContent>
          </GlowingCard>
        </div>

        {/* Data Sources */}
        <GlowingCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <ExternalLink className="w-6 h-6 text-secondary" />
              Data Sources & Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 glass-card">
                <img src={nasaLogo} alt="NASA Logo" className="w-16 h-16 object-contain" />
                <div>
                  <h3 className="font-semibold mb-2 font-orbitron">NASA DONKI Database</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time space weather data from NASA's Database of Notifications, Knowledge, Information (DONKI). 
                    Includes solar flares, CMEs, geomagnetic storms, and solar energetic particle events.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <h4 className="font-medium mb-2 font-space-mono">Update Frequency</h4>
                  <p className="text-sm text-muted-foreground">Data refreshes every 4 hours with intelligent caching and background updates</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="font-medium mb-2 font-space-mono">Coverage Period</h4>
                  <p className="text-sm text-muted-foreground">Historical data from 2016 to present, with real-time monitoring of current events</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="font-medium mb-2 font-space-mono">3D Visualization</h4>
                  <p className="text-sm text-muted-foreground">Advanced WebGL-based 3D models for immersive space weather analysis</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="font-medium mb-2 font-space-mono">Performance</h4>
                  <p className="text-sm text-muted-foreground">Optimized caching system reduces API calls while maintaining data freshness</p>
                </div>
              </div>
            </div>
          </CardContent>
        </GlowingCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team & Contact */}
          <GlowingCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <Users className="w-6 h-6 text-success" />
                Development Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                SolarShield is developed by space weather experts and software engineers dedicated to 
                protecting critical infrastructure through advanced monitoring and early warning systems.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">Space Physics</Badge>
                  <Badge variant="outline">Software Engineering</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">Data Science</Badge>
                  <Badge variant="outline">3D Visualization</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">Infrastructure Security</Badge>
                  <Badge variant="outline">Real-time Systems</Badge>
                </div>
              </div>
            </CardContent>
          </GlowingCard>

          <GlowingCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <Mail className="w-6 h-6 text-primary" />
                Contact & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1 font-space-mono">Technical Support</h4>
                <p className="text-sm text-muted-foreground">support@solarshield.space</p>
              </div>
              <div>
                <h4 className="font-medium mb-1 font-space-mono">Emergency Alerts</h4>
                <p className="text-sm text-muted-foreground">alerts@solarshield.space</p>
              </div>
              <div>
                <h4 className="font-medium mb-1 font-space-mono">Partnership Inquiries</h4>
                <p className="text-sm text-muted-foreground">partnerships@solarshield.space</p>
              </div>
            </CardContent>
          </GlowingCard>
        </div>

        {/* Disclaimer */}
        <GlowingCard glowColor="warning">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-warning font-orbitron">Important Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              SolarShield is a monitoring and educational tool. While we strive for accuracy, users should 
              consult official sources like NOAA Space Weather Prediction Center for operational decisions. 
              This system should not be the sole source for critical infrastructure protection measures.
            </p>
          </CardContent>
        </GlowingCard>
      </div>
    </div>
  );
}