import React, { useState } from 'react';
import { Satellite, Zap, Plane, Navigation, Shield, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlowingCard from '@/components/GlowingCard';
import ParticleField from '@/components/ParticleField';
import SatelliteConstellation from '@/components/3d/SatelliteConstellation';
import InfrastructureRiskHeatmap from '@/components/3d/InfrastructureRiskHeatmap';
import { motion } from 'framer-motion';
import { StatusIndicator } from '@/components/StatusIndicator';

const sectors = [
  {
    name: 'Satellite Communications',
    icon: Satellite,
    status: 'warning',
    risk: 'High',
    description: 'GPS and communication satellites experiencing intermittent signal loss',
    details: 'Multiple geostationary satellites report degraded performance due to increased radiation levels. GPS accuracy reduced by 15%.',
    affected: 156,
    total: 2847
  },
  {
    name: 'Power Grid Systems',
    icon: Zap,
    status: 'critical',
    risk: 'Critical',
    description: 'Transformer monitoring systems detecting anomalous magnetic fluctuations',
    details: 'Northern grid regions showing increased vulnerability. Automatic load balancing systems active.',
    affected: 23,
    total: 891
  },
  {
    name: 'Aviation Operations',
    icon: Plane,
    status: 'warning',
    risk: 'Moderate',
    description: 'Polar route flights experiencing navigation difficulties',
    details: 'High-altitude flights over polar regions advised to use alternative navigation methods.',
    affected: 45,
    total: 12567
  },
  {
    name: 'GPS Navigation',
    icon: Navigation,
    status: 'warning',
    risk: 'Moderate',
    description: 'Positioning accuracy degraded in high-latitude regions',
    details: 'Civil GPS services showing 3-5 meter accuracy loss. Military GPS unaffected.',
    affected: 234,
    total: 8934
  }
];

const riskData = [
  { latitude: 60.2, longitude: -149.9, sector: 'power' as const, riskLevel: 0.9, name: 'Anchorage Grid' },
  { latitude: 64.8, longitude: -147.7, sector: 'satellites' as const, riskLevel: 0.85, name: 'Fairbanks Satellite' },
  { latitude: 40.7, longitude: -74.0, sector: 'power' as const, riskLevel: 0.6, name: 'NYC Power Grid' },
  { latitude: 51.5, longitude: -0.1, sector: 'aviation' as const, riskLevel: 0.7, name: 'London Heathrow' },
  { latitude: 35.7, longitude: 139.7, sector: 'gps' as const, riskLevel: 0.5, name: 'Tokyo GPS Center' },
];

export default function Impact() {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'moderate': return 'text-primary';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const currentThreatLevel = 0.7; // High threat level for demo

  return (
    <div className="min-h-screen bg-gradient-space p-6">
      <ParticleField />
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-aurora bg-clip-text text-transparent font-orbitron">
              Infrastructure Impact
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time monitoring of space weather effects on critical systems
            </p>
          </div>
        </motion.div>

        {/* 3D Satellite Constellation */}
        <GlowingCard glowColor="primary" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-neon font-orbitron">Satellite Constellation Status</CardTitle>
            <CardDescription>
              Real-time satellite health and space weather threat assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SatelliteConstellation 
              threatLevel={currentThreatLevel}
              earthRadius={2}
            />
          </CardContent>
        </GlowingCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3D Infrastructure Risk Heatmap */}
          <GlowingCard glowColor="secondary" className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-neon font-orbitron">Global Risk Assessment</CardTitle>
              <CardDescription>
                3D visualization of infrastructure vulnerability by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Tabs value={selectedSector} onValueChange={setSelectedSector}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="satellites">Satellites</TabsTrigger>
                    <TabsTrigger value="power">Power</TabsTrigger>
                    <TabsTrigger value="aviation">Aviation</TabsTrigger>
                    <TabsTrigger value="gps">GPS</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <InfrastructureRiskHeatmap 
                riskData={riskData}
                currentThreatLevel={currentThreatLevel}
                selectedSector={selectedSector === 'all' ? undefined : selectedSector}
              />
            </CardContent>
          </GlowingCard>

          {/* Global Risk Overview */}
          <GlowingCard>
            <CardHeader>
              <CardTitle className="font-orbitron">Global Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-destructive counter-animate">
                    Critical
                  </div>
                  <div className="text-sm text-muted-foreground">Threat Level</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-warning counter-animate">
                    {riskData.filter(r => r.riskLevel > 0.7).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Risk Zones</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold font-orbitron">Regional Status</h4>
                {[
                  { region: 'North America', status: 'warning', description: 'Power grid vulnerabilities detected' },
                  { region: 'Europe', status: 'normal', description: 'All systems operating normally' },
                  { region: 'Asia-Pacific', status: 'warning', description: 'Satellite communications affected' },
                  { region: 'Arctic Region', status: 'critical', description: 'High geomagnetic activity' }
                ].map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass-card">
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={region.status as any} />
                      <span className="text-sm font-space-mono">{region.region}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {region.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlowingCard>
        </div>

        {/* Sector Impact Analysis */}
        <GlowingCard>
          <CardHeader>
            <CardTitle className="font-orbitron">Sector Impact Analysis</CardTitle>
            <CardDescription>
              Detailed assessment of space weather effects on critical infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectors.map((sector, index) => {
                const Icon = sector.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 hover:shadow-glow-primary transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/20">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold font-orbitron">{sector.name}</h3>
                          <Badge 
                            variant={sector.status === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {sector.risk}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {sector.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            {sector.details}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Affected: {sector.affected} / {sector.total}
                            </span>
                            <div className="flex items-center gap-1">
                              {sector.status === 'critical' ? (
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-warning" />
                              )}
                              <StatusIndicator status={sector.status as any} size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </GlowingCard>

        {/* Historical Impact Cases */}
        <GlowingCard>
          <CardHeader>
            <CardTitle className="font-orbitron">Notable Impact Cases</CardTitle>
            <CardDescription>Historical space weather events and their economic impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: 'March 13, 1989',
                  event: 'Quebec Blackout',
                  impact: '$2 billion',
                  description: 'Geomagnetic storm caused a 9-hour blackout affecting 6 million people',
                  severity: 'critical'
                },
                {
                  date: 'October 2003',
                  event: 'Halloween Storm',
                  impact: '$1.5 billion',
                  description: 'GPS systems failed, airlines rerouted flights, satellites damaged',
                  severity: 'high'
                },
                {
                  date: 'September 2017',
                  event: 'Solar Radio Blackout',
                  impact: '$500 million',
                  description: 'Aviation communications disrupted, emergency services affected',
                  severity: 'moderate'
                }
              ].map((incident, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-4 border-l-4 ${
                    incident.severity === 'critical' 
                      ? 'border-l-destructive' 
                      : incident.severity === 'high'
                        ? 'border-l-warning'
                        : 'border-l-primary'
                  } hover:shadow-glow-primary transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          variant={
                            incident.severity === 'critical' 
                              ? 'destructive' 
                              : incident.severity === 'high' 
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-space-mono">
                          {incident.date}
                        </span>
                      </div>
                      <h3 className="font-semibold font-orbitron mb-1">{incident.event}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {incident.description}
                      </p>
                      <div className="text-sm">
                        <span className="text-warning">Economic Impact: {incident.impact}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </GlowingCard>
      </div>
    </div>
  );
}