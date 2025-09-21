import React from 'react';
import { Calendar, TrendingUp, Activity, Zap, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlowingCard from '@/components/GlowingCard';
import ParticleField from '@/components/ParticleField';
import SpacetimeEvents from '@/components/3d/SpacetimeEvents';
import SolarCycleHelix from '@/components/3d/SolarCycleHelix';
import { motion } from 'framer-motion';

// Mock historical data
const historicalEvents = [
  {
    id: '1',
    type: 'flare' as const,
    intensity: 9.3,
    duration: 45,
    impactScore: 8.5,
    date: '2023-12-15T10:30:00Z',
    title: 'X9.3 Solar Flare'
  },
  {
    id: '2',
    type: 'storm' as const,
    intensity: 7.2,
    duration: 120,
    impactScore: 7.8,
    date: '2023-11-28T14:20:00Z',
    title: 'Severe Geomagnetic Storm'
  },
  {
    id: '3',
    type: 'cme' as const,
    intensity: 6.8,
    duration: 72,
    impactScore: 6.5,
    date: '2023-10-10T08:45:00Z',
    title: 'Earth-Directed CME'
  }
];

const solarCycleEvents = [
  { date: '2023-12-01', type: 'flare' as const, magnitude: 0.8, intensity: 9.3 },
  { date: '2023-11-15', type: 'storm' as const, magnitude: 0.7, intensity: 7.2 },
  { date: '2023-10-20', type: 'cme' as const, magnitude: 0.6, intensity: 6.8 },
  { date: '2023-09-05', type: 'flare' as const, magnitude: 0.5, intensity: 5.1 },
];

export default function History() {
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
              Historical Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive space weather event analysis and trends
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 btn-holographic">
              <Calendar className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 btn-holographic">
              <TrendingUp className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* 4D Spacetime Visualization */}
        <GlowingCard glowColor="primary" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-neon font-orbitron">4D Spacetime Event Analysis</CardTitle>
            <CardDescription>
              Interactive 3D scatter plot showing relationships between event parameters over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpacetimeEvents 
              events={historicalEvents}
              xAxis="intensity"
              yAxis="duration" 
              zAxis="impactScore"
              timeAxis="date"
            />
          </CardContent>
        </GlowingCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solar Cycle Helix */}
          <GlowingCard glowColor="secondary" className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-neon font-orbitron">Solar Cycle Evolution</CardTitle>
              <CardDescription>
                11-year solar cycle visualization with historical events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SolarCycleHelix 
                events={solarCycleEvents}
                cycleYears={11}
                helixRadius={4}
                helixHeight={10}
              />
            </CardContent>
          </GlowingCard>

          {/* Historical Statistics */}
          <GlowingCard>
            <CardHeader>
              <CardTitle className="font-orbitron">Event Statistics</CardTitle>
              <CardDescription>Key metrics from historical analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-primary counter-animate">
                    1,247
                  </div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-warning counter-animate">
                    89
                  </div>
                  <div className="text-sm text-muted-foreground">Major Events</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-space-mono">Solar Flares</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-space-mono">Geomagnetic Storms</span>
                    <span>22%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-accent to-primary h-2 rounded-full" style={{width: '22%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-space-mono">CME Events</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlowingCard>
        </div>

        {/* Major Events Timeline */}
        <GlowingCard>
          <CardHeader>
            <CardTitle className="font-orbitron">Notable Impact Cases</CardTitle>
            <CardDescription>Historical events with significant technological impacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: 'March 13, 1989',
                  event: 'Quebec Blackout',
                  description: 'Geomagnetic storm caused widespread power outages affecting 6 million people',
                  severity: 'critical',
                  impact: '$2 billion economic loss',
                  type: 'Geomagnetic Storm'
                },
                {
                  date: 'October 28, 2003',
                  event: 'Halloween Solar Storm',
                  description: 'X28+ solar flare disrupted satellite communications and GPS systems',
                  severity: 'high',
                  impact: '$1.5 billion satellite damage',
                  type: 'Solar Flare'
                },
                {
                  date: 'July 23, 2012',
                  event: 'Near-Miss Carrington Event',
                  description: 'Massive CME narrowly missed Earth, could have caused global blackouts',
                  severity: 'critical',
                  impact: 'Potential $2 trillion damage',
                  type: 'CME'
                }
              ].map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-4 border-l-4 ${
                    event.severity === 'critical' 
                      ? 'border-l-destructive' 
                      : 'border-l-warning'
                  } hover:shadow-glow-primary transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {event.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-space-mono">
                          {event.date}
                        </span>
                      </div>
                      <h3 className="font-semibold font-orbitron mb-1">{event.event}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-warning">
                          Economic Impact: {event.impact}
                        </span>
                        <div className="flex gap-1">
                          <Activity className="h-4 w-4 text-primary" />
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
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