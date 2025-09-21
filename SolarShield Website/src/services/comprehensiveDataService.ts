import { supabase } from '@/integrations/supabase/client';
import { nasaApi, SolarFlare, GeomagneticStorm, CME, SolarEnergeticParticle } from './nasaApi';

interface ComprehensiveSpaceWeatherData {
  flares: SolarFlare[];
  storms: GeomagneticStorm[];
  cmes: CME[];
  particles: SolarEnergeticParticle[];
  processedAnalytics: {
    totalEvents: number;
    criticalAlerts: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    solarActivity: number;
    geomagneticActivity: number;
    cmeSpeed: number[];
    impactPredictions: any[];
  };
  lastUpdated: string;
  cacheVersion: number;
}

class ComprehensiveDataService {
  private static instance: ComprehensiveDataService;
  private cache: ComprehensiveSpaceWeatherData | null = null;
  private isLoading = false;

  static getInstance(): ComprehensiveDataService {
    if (!ComprehensiveDataService.instance) {
      ComprehensiveDataService.instance = new ComprehensiveDataService();
    }
    return ComprehensiveDataService.instance;
  }

  async initializeAppData(): Promise<ComprehensiveSpaceWeatherData> {
    console.log('🚀 Initializing comprehensive space weather data...');
    
    if (this.cache && this.isCacheValid()) {
      console.log('📋 Using valid cache');
      return this.cache;
    }

    if (this.isLoading) {
      console.log('⏳ Data loading in progress, waiting...');
      return this.waitForLoad();
    }

    this.isLoading = true;

    try {
      // First try to load from comprehensive cache
      const cachedData = await this.loadFromComprehensiveCache();
      
      if (cachedData && this.isDataRecent(cachedData.lastUpdated)) {
        console.log('💾 Using recent cached data from Supabase');
        this.cache = cachedData;
        this.isLoading = false;
        
        // Update in background
        this.updateDataInBackground();
        return cachedData;
      }

      // Load fresh data from NASA API
      console.log('🌐 Loading fresh data from NASA API...');
      const freshData = await this.loadFreshDataFromNASA();
      
      // Store in comprehensive cache
      await this.storeInComprehensiveCache(freshData);
      
      this.cache = freshData;
      this.isLoading = false;
      return freshData;

    } catch (error) {
      console.error('❌ Failed to initialize data:', error);
      this.isLoading = false;
      
      // Return fallback data
      return this.getFallbackData();
    }
  }

  private async loadFromComprehensiveCache(): Promise<ComprehensiveSpaceWeatherData | null> {
    try {
      const { data, error } = await supabase
        .from('space_weather_cache')
        .select('*')
        .eq('data_type', 'comprehensive_dataset')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        flares: (data.solar_flares as unknown as SolarFlare[]) || [],
        storms: (data.geomagnetic_storms as unknown as GeomagneticStorm[]) || [],
        cmes: (data.cme_events as unknown as CME[]) || [],
        particles: (data.sep_events as unknown as SolarEnergeticParticle[]) || [],
        processedAnalytics: (data.processed_analytics as unknown as ComprehensiveSpaceWeatherData['processedAnalytics']) || this.getDefaultAnalytics(),
        lastUpdated: data.last_updated,
        cacheVersion: data.cache_version || 1
      };
    } catch (error) {
      console.error('Failed to load from cache:', error);
      return null;
    }
  }

  private async loadFreshDataFromNASA(): Promise<ComprehensiveSpaceWeatherData> {
    console.log('📡 Fetching comprehensive data from NASA API...');
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year
    
    // Get all space weather data
    const allData = await nasaApi.getAllSpaceWeatherData();
    
    // Process analytics
    const processedAnalytics = this.processAnalytics(allData);
    
    const comprehensiveData: ComprehensiveSpaceWeatherData = {
      ...allData,
      processedAnalytics,
      lastUpdated: new Date().toISOString(),
      cacheVersion: 2
    };

    console.log('✅ NASA data processed successfully:', {
      flares: allData.flares.length,
      storms: allData.storms.length,
      cmes: allData.cmes.length,
      particles: allData.particles.length
    });

    return comprehensiveData;
  }

  private processAnalytics(data: any): ComprehensiveSpaceWeatherData['processedAnalytics'] {
    const totalEvents = (data.flares?.length || 0) + (data.storms?.length || 0) + (data.cmes?.length || 0);
    
    // Calculate risk levels
    const criticalFlares = data.flares?.filter((f: SolarFlare) => 
      f.classType && (f.classType.startsWith('X') || f.classType.startsWith('M'))
    ).length || 0;
    
    const majorStorms = data.storms?.filter((s: GeomagneticStorm) => 
      s.allKpIndex?.some(kp => kp.kpIndex >= 5)
    ).length || 0;

    const fastCMEs = data.cmes?.filter((c: CME) => 
      c.cmeAnalyses?.some(analysis => analysis.speed > 1000)
    ).length || 0;

    const criticalAlerts = criticalFlares + majorStorms + fastCMEs;
    
    // Determine overall risk level
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    if (criticalAlerts > 10) riskLevel = 'critical';
    else if (criticalAlerts > 5) riskLevel = 'high';
    else if (criticalAlerts > 2) riskLevel = 'moderate';

    // Calculate activity indices
    const solarActivity = Math.min(100, (criticalFlares / Math.max(1, data.flares?.length || 1)) * 100);
    const geomagneticActivity = Math.min(100, (majorStorms / Math.max(1, data.storms?.length || 1)) * 100);

    // CME speed analysis
    const cmeSpeed = data.cmes?.map((c: CME) => 
      c.cmeAnalyses?.[0]?.speed || 0
    ).filter((speed: number) => speed > 0) || [];

    return {
      totalEvents,
      criticalAlerts,
      riskLevel,
      solarActivity,
      geomagneticActivity,
      cmeSpeed,
      impactPredictions: this.calculateImpactPredictions(data)
    };
  }

  private calculateImpactPredictions(data: any): any[] {
    // Calculate impact predictions based on incoming CMEs and current conditions
    const predictions = [];
    const now = new Date();

    data.cmes?.forEach((cme: CME) => {
      if (cme.cmeAnalyses?.length) {
        const analysis = cme.cmeAnalyses[0];
        const speed = analysis.speed || 0;
        
        if (speed > 400) { // Earth-directed CME threshold
          const arrivalTime = new Date(new Date(cme.startTime).getTime() + (150000000 / (speed * 1000)) * 1000); // Rough calculation
          
          if (arrivalTime > now) {
            predictions.push({
              type: 'cme_impact',
              arrivalTime: arrivalTime.toISOString(),
              severity: speed > 1000 ? 'high' : speed > 700 ? 'moderate' : 'low',
              description: `CME impact predicted with ${speed} km/s velocity`
            });
          }
        }
      }
    });

    return predictions;
  }

  private async storeInComprehensiveCache(data: ComprehensiveSpaceWeatherData): Promise<void> {
    try {
      const { error } = await supabase
        .from('space_weather_cache')
        .upsert({
          data_type: 'comprehensive_dataset',
          solar_flares: data.flares as any,
          geomagnetic_storms: data.storms as any,
          cme_events: data.cmes as any,
          sep_events: data.particles as any,
          processed_analytics: data.processedAnalytics as any,
          last_updated: data.lastUpdated,
          cache_version: data.cacheVersion
        } as any);

      if (error) {
        console.error('Failed to store in cache:', error);
      } else {
        console.log('💾 Data successfully cached in Supabase');
      }
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  private isDataRecent(lastUpdated: string): boolean {
    const updateTime = new Date(lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate < 6; // Consider data recent if less than 6 hours old
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    return this.isDataRecent(this.cache.lastUpdated);
  }

  private async updateDataInBackground(): Promise<void> {
    try {
      console.log('🔄 Background update started...');
      const freshData = await this.loadFreshDataFromNASA();
      await this.storeInComprehensiveCache(freshData);
      this.cache = freshData;
      console.log('✅ Background update completed');
    } catch (error) {
      console.error('Background update failed:', error);
    }
  }

  private async waitForLoad(): Promise<ComprehensiveSpaceWeatherData> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isLoading && this.cache) {
          clearInterval(checkInterval);
          resolve(this.cache);
        }
      }, 100);
    });
  }

  private getDefaultAnalytics(): ComprehensiveSpaceWeatherData['processedAnalytics'] {
    return {
      totalEvents: 0,
      criticalAlerts: 0,
      riskLevel: 'low',
      solarActivity: 0,
      geomagneticActivity: 0,
      cmeSpeed: [],
      impactPredictions: []
    };
  }

  private getFallbackData(): ComprehensiveSpaceWeatherData {
    return {
      flares: [],
      storms: [],
      cmes: [],
      particles: [],
      processedAnalytics: this.getDefaultAnalytics(),
      lastUpdated: new Date().toISOString(),
      cacheVersion: 1
    };
  }

  // Public methods for accessing cached data
  async getCachedData(): Promise<ComprehensiveSpaceWeatherData> {
    if (this.cache && this.isCacheValid()) {
      return this.cache;
    }
    return this.initializeAppData();
  }

  async forceRefresh(): Promise<ComprehensiveSpaceWeatherData> {
    this.cache = null;
    return this.initializeAppData();
  }
}

export const comprehensiveDataService = ComprehensiveDataService.getInstance();
export type { ComprehensiveSpaceWeatherData };