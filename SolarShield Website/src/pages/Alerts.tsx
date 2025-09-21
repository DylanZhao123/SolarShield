import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, Settings, Clock, TrendingUp } from 'lucide-react';
import { nasaApi } from '@/services/nasaApi';
import { StatusIndicator } from '@/components/StatusIndicator';
import GlowingCard from '@/components/GlowingCard';
import ParticleField from '@/components/ParticleField';
import AlertTimelineSpiral from '@/components/3d/AlertTimelineSpiral';
import Earth3DAdvanced from '@/components/3d/Earth3DAdvanced';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      try {
        const data = await nasaApi.getAllSpaceWeatherData();
        
        // Transform data into alerts
        const alertList = [];
        
        // Add flare alerts
        data.flares.forEach(flare => {
          if (flare.classType.startsWith('X') || flare.classType.startsWith('M')) {
            alertList.push({
              id: flare.flrID,
              type: 'Solar Flare',
              severity: flare.classType.startsWith('X') ? 'critical' : 'warning',
              title: `${flare.classType} Solar Flare Detected`,
              description: `Source region: ${flare.sourceLocation}`,
              time: new Date(flare.peakTime),
              impact: 'Radio communications, satellite operations'
            });
          }
        });

        // Add storm alerts
        data.storms.forEach(storm => {
          const latestKp = storm.allKpIndex[storm.allKpIndex.length - 1];
          if (latestKp && latestKp.kpIndex >= 5) {
            alertList.push({
              id: storm.gstID,
              type: 'Geomagnetic Storm',
              severity: latestKp.kpIndex >= 7 ? 'critical' : 'warning',
              title: `G${Math.min(5, latestKp.kpIndex - 4)} Geomagnetic Storm`,
              description: `Kp index: ${latestKp.kpIndex}`,
              time: new Date(storm.startTime),
              impact: 'Power grids, satellite navigation, aurora visible'
            });
          }
        });

        // Sort by time (most recent first)
        alertList.sort((a, b) => b.time.getTime() - a.time.getTime());
        
        setAlerts(alertList);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { 
          variant: 'destructive' as const, 
          color: 'border-destructive bg-destructive/10',
          icon: '🔴'
        };
      case 'warning':
        return { 
          variant: 'default' as const, 
          color: 'border-warning bg-warning/10',
          icon: '⚠️'
        };
      default:
        return { 
          variant: 'secondary' as const, 
          color: 'border-muted bg-muted/10',
          icon: '🔵'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-space p-6">
      <ParticleField />
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-aurora bg-clip-text text-transparent font-orbitron">
              Space Weather Alerts
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time warnings and advanced monitoring systems
            </p>
          </div>
          <Button variant="outline" className="gap-2 btn-holographic">
            <Settings className="w-4 h-4" />
            Alert Settings
          </Button>
        </div>

        {/* 3D Alert Timeline Visualization */}
        <GlowingCard glowColor="primary" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-neon font-orbitron">Alert Timeline Spiral</CardTitle>
            <CardDescription>
              3D visualization of space weather events and alert progression over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertTimelineSpiral 
              alerts={alerts.map(alert => ({
                id: alert.id,
                type: alert.type.toLowerCase().includes('flare') ? 'flare' as const : 
                      alert.type.toLowerCase().includes('storm') ? 'storm' as const : 'cme' as const,
                severity: alert.severity === 'critical' ? 'critical' as const : 
                         alert.severity === 'warning' ? 'high' as const : 'moderate' as const,
                time: alert.time.toISOString(),
                title: alert.title
              }))}
              radius={5}
              height={8}
            />
          </CardContent>
        </GlowingCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Summary */}
          <GlowingCard>
            <CardHeader>
              <CardTitle className="font-orbitron">Alert Overview</CardTitle>
              <CardDescription>Current threat assessment and alert statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="glass-card p-4 border-l-4 border-l-destructive">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-destructive counter-animate">
                        {alerts.filter(a => a.severity === 'critical').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Critical Alerts</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </div>

                <div className="glass-card p-4 border-l-4 border-l-warning">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-warning counter-animate">
                        {alerts.filter(a => a.severity === 'warning').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Active Warnings</p>
                    </div>
                    <Bell className="h-8 w-8 text-warning" />
                  </div>
                </div>

                <div className="glass-card p-4 border-l-4 border-l-secondary">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-secondary counter-animate">Low</div>
                      <p className="text-sm text-muted-foreground">72h Forecast Risk</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-secondary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </GlowingCard>

          {/* 3D Earth with Real-time Effects */}
          <GlowingCard glowColor="secondary" className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-neon font-orbitron">Real-time Earth Effects</CardTitle>
              <CardDescription>
                Live visualization of space weather impact on Earth's magnetosphere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Earth3DAdvanced 
                spaceWeatherIntensity={Math.min(1, alerts.filter(a => a.severity === 'critical').length * 0.3 + 
                                                   alerts.filter(a => a.severity === 'warning').length * 0.2)}
                impactZones={[
                  { latitude: 65, longitude: -150, severity: 'critical', type: 'Aurora Zone' },
                  { latitude: 70, longitude: 20, severity: 'high', type: 'Polar Region' },
                  { latitude: -65, longitude: 140, severity: 'high', type: 'Antarctic Zone' }
                ]}
                showMagnetosphere={true}
                showAurora={alerts.some(a => a.type.includes('Storm'))}
                cmeTrajectories={alerts.filter(a => a.type.includes('Flare')).slice(0, 3).map((_, i) => ({
                  direction: new THREE.Vector3(Math.cos(i * 2), 0.2, Math.sin(i * 2)),
                  speed: 400,
                  intensity: 0.7
                }))}
              />
            </CardContent>
          </GlowingCard>
        </div>

        {/* Active Alerts */}
        <GlowingCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Active Alerts
            </CardTitle>
            <CardDescription>Real-time space weather events requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading alerts...</p>
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, index) => {
                  const config = getSeverityConfig(alert.severity);
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 glass-card border-l-4 ${
                        alert.severity === 'critical' 
                          ? 'border-l-destructive' 
                          : 'border-l-warning'
                      } hover:shadow-glow-primary transition-all duration-300`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{config.icon}</span>
                            <Badge variant={config.variant}>{alert.type}</Badge>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alert.time.toLocaleString()}
                            </div>
                          </div>
                          <h3 className="font-semibold mb-1">{alert.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="text-sm">
                            <strong>Potential Impact:</strong> {alert.impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <StatusIndicator status="normal" size="lg" />
                <p className="text-muted-foreground mt-4">No active alerts</p>
                <p className="text-sm text-muted-foreground">Space weather conditions are currently normal</p>
              </div>
            )}
          </CardContent>
        </GlowingCard>

        {/* Prediction Timeline */}
        <GlowingCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <TrendingUp className="w-5 h-5 text-secondary" />
              72-Hour Forecast
            </CardTitle>
            <CardDescription>Predictive analysis of space weather conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="p-4 glass-card border-l-4 border-l-success"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="font-medium">Next 24 Hours</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Low geomagnetic activity expected</p>
                </div>
                <div 
                  className="p-4 glass-card border-l-4 border-l-warning"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="font-medium">24-48 Hours</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Minor storm possible from incoming CME</p>
                </div>
                <div 
                  className="p-4 glass-card border-l-4 border-l-muted"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <span className="font-medium">48-72 Hours</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Conditions returning to normal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </GlowingCard>
      </div>
    </div>
  );
}