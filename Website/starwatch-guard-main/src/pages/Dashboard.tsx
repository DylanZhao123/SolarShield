import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Shield, Satellite, TrendingUp, Globe } from 'lucide-react';
import { StatusIndicator } from '@/components/StatusIndicator';
import { EventCard } from '@/components/EventCard';
import { useSpaceWeatherData } from '@/hooks/useSpaceWeatherData';
import GlowingCard from '@/components/GlowingCard';
import Earth3D from '@/components/Earth3D';
import ParticleField from '@/components/ParticleField';

export default function Dashboard() {
  const { flares, storms, cmes, particles, lastUpdate, isLoading, refresh } = useSpaceWeatherData();

  const getOverallStatus = (): { level: 'normal' | 'warning' | 'critical' | 'unknown'; text: string; intensity: number } => {
    const recentFlares = flares.filter(flare => 
      flare.classType.startsWith('X') || flare.classType.startsWith('M')
    );
    const activeStorms = storms.filter(storm => {
      const latestKp = storm.allKpIndex[storm.allKpIndex.length - 1];
      return latestKp && latestKp.kpIndex >= 5;
    });

    const xFlares = flares.filter(f => f.classType.startsWith('X')).length;
    const severity = activeStorms.reduce((max, storm) => {
      const latestKp = storm.allKpIndex[storm.allKpIndex.length - 1];
      return Math.max(max, latestKp?.kpIndex || 0);
    }, 0);

    if (xFlares > 0 || severity >= 7) {
      return { level: 'critical', text: 'Severe Space Weather', intensity: 1.0 };
    }
    if (recentFlares.length > 0 || severity >= 5) {
      return { level: 'warning', text: 'Active Space Weather', intensity: 0.7 };
    }
    return { level: 'normal', text: 'Quiet Conditions', intensity: 0.3 };
  };

  const status = getOverallStatus();

  return (
    <div className="min-h-screen bg-gradient-space relative overflow-hidden">
      <ParticleField particleCount={800} color="#00D4FF" speed={1} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Futuristic Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h1 className="text-6xl font-orbitron font-black mb-2 text-neon">
              SOLARSHIELD
            </h1>
            <motion.p 
              className="text-muted-foreground text-lg font-space-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Advanced Space Weather Intelligence System
            </motion.p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-sm text-muted-foreground font-space-mono">
              Last sync: {lastUpdate?.toLocaleTimeString() || 'Never'}
            </div>
            <Button 
              onClick={refresh} 
              disabled={isLoading}
              className="btn-holographic gap-2 font-space-mono"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              SYNC DATA
            </Button>
          </div>
        </motion.div>

        {/* Futuristic Status Hero with 3D Earth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GlowingCard 
            className="lg:col-span-1" 
            glowColor={status.level === 'critical' ? 'warning' : status.level === 'warning' ? 'secondary' : 'primary'}
            intensity="high"
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full justify-center">
                  <StatusIndicator status={status.level} size="lg" />
                  <div className="text-center">
                    <h2 className="text-3xl font-orbitron font-bold text-glow">{status.text}</h2>
                    <p className="text-muted-foreground font-space-mono">Global threat assessment</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center w-full">
                  <motion.div 
                    className="hexagon-data-container"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-primary font-space-mono counter-animate">{flares.length}</div>
                    <div className="text-xs text-muted-foreground">FLARES</div>
                  </motion.div>
                  <motion.div 
                    className="hexagon-data-container"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-secondary font-space-mono counter-animate">{cmes.length}</div>
                    <div className="text-xs text-muted-foreground">CMEs</div>
                  </motion.div>
                  <motion.div 
                    className="hexagon-data-container"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-warning font-space-mono counter-animate">{storms.length}</div>
                    <div className="text-xs text-muted-foreground">STORMS</div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </GlowingCard>
          
          <GlowingCard className="lg:col-span-1" glowColor="primary" intensity="medium">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-orbitron font-bold text-primary mb-2">EARTH IMPACT ZONE</h3>
                <p className="text-sm text-muted-foreground font-space-mono">Real-time magnetosphere visualization</p>
              </div>
              <Earth3D spaceWeatherIntensity={status.intensity} />
            </CardContent>
          </GlowingCard>
        </div>

        {/* Holographic Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, staggerChildren: 0.1 }}
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlowingCard glowColor="primary" intensity="medium" animated={false}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-space-mono">X-RAY FLUX</CardTitle>
                <Zap className="h-5 w-5 text-primary pulse-glow" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-orbitron text-glow">
                  {flares.length > 0 ? flares[0].classType : 'C1.0'}
                </div>
                <p className="text-xs text-muted-foreground font-space-mono">CURRENT LEVEL</p>
              </CardContent>
            </GlowingCard>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlowingCard glowColor="warning" intensity="medium" animated={false}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-space-mono">KP INDEX</CardTitle>
                <Shield className="h-5 w-5 text-warning pulse-glow" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-orbitron text-warning text-glow">
                  {storms.length > 0 ? 
                    storms[0].allKpIndex[storms[0].allKpIndex.length - 1]?.kpIndex || '2' : '2'}
                </div>
                <p className="text-xs text-muted-foreground font-space-mono">
                  {storms.length > 0 && storms[0].allKpIndex[storms[0].allKpIndex.length - 1]?.kpIndex >= 5 
                    ? 'STORM CONDITIONS' : 'QUIET CONDITIONS'}
                </p>
              </CardContent>
            </GlowingCard>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlowingCard glowColor="secondary" intensity="medium" animated={false}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-space-mono">ACTIVE CMEs</CardTitle>
                <Globe className="h-5 w-5 text-secondary pulse-glow" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-orbitron text-secondary text-glow">{cmes.length}</div>
                <p className="text-xs text-muted-foreground font-space-mono">EARTH-DIRECTED</p>
              </CardContent>
            </GlowingCard>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlowingCard glowColor="success" intensity="medium" animated={false}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-space-mono">THREAT LEVEL</CardTitle>
                <TrendingUp className="h-5 w-5 text-success pulse-glow" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-orbitron text-success text-glow">
                  {status.level === 'critical' ? 'HIGH' : status.level === 'warning' ? 'MED' : 'LOW'}
                </div>
                <p className="text-xs text-muted-foreground font-space-mono">24H FORECAST</p>
              </CardContent>
            </GlowingCard>
          </motion.div>
        </motion.div>

        {/* Advanced Event Intelligence Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <GlowingCard glowColor="primary" intensity="high">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-orbitron text-lg">
                <Zap className="w-6 h-6 text-primary pulse-glow" />
                SOLAR FLARE TRACKING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flares.slice(0, 3).map((flare, index) => (
                  <motion.div
                    key={flare.flrID || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EventCard
                      type="flare"
                      title={`${flare.classType} SOLAR FLARE`}
                      time={new Date(flare.peakTime).toLocaleString()}
                      description={`Origin: ${flare.sourceLocation}`}
                      severity={flare.classType.startsWith('X') ? 'high' : flare.classType.startsWith('M') ? 'medium' : 'low'}
                    />
                  </motion.div>
                ))}
                {flares.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground font-space-mono">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    NO ACTIVE FLARE EVENTS
                  </div>
                )}
              </div>
            </CardContent>
          </GlowingCard>

          <GlowingCard glowColor="secondary" intensity="high">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-orbitron text-lg">
                <Shield className="w-6 h-6 text-secondary pulse-glow" />
                MAGNETOSPHERE STATUS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storms.slice(0, 3).map((storm, index) => {
                  const latestKp = storm.allKpIndex[storm.allKpIndex.length - 1];
                  return (
                    <motion.div
                      key={storm.gstID || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <EventCard
                        type="storm"
                        title="GEOMAGNETIC DISTURBANCE"
                        time={new Date(storm.startTime).toLocaleString()}
                        description={`Kp Index: ${latestKp?.kpIndex || 'N/A'} | Intensity: ${
                          !latestKp ? 'Unknown' : 
                          latestKp.kpIndex >= 7 ? 'SEVERE' : 
                          latestKp.kpIndex >= 5 ? 'MODERATE' : 'WEAK'
                        }`}
                        severity={!latestKp ? 'low' : latestKp.kpIndex >= 7 ? 'high' : latestKp.kpIndex >= 5 ? 'medium' : 'low'}
                      />
                    </motion.div>
                  );
                })}
                {storms.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground font-space-mono">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    MAGNETOSPHERE STABLE
                  </div>
                )}
              </div>
            </CardContent>
          </GlowingCard>
        </motion.div>
      </div>
    </div>
  );
}