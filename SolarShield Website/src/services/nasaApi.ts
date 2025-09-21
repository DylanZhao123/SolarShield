const NASA_API_KEY = '34HTvYDDQLKE254zSp9hlPZOYiKfMMhgq656B2LE';
const BASE_URL = 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get';

export interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  classType: string;
  sourceLocation: string;
  activeRegionNum?: number;
}

export interface GeomagneticStorm {
  gstID: string;
  startTime: string;
  allKpIndex: Array<{
    observedTime: string;
    kpIndex: number;
  }>;
}

export interface CME {
  activityID: string;
  startTime: string;
  sourceLocation?: string;
  note?: string;
  cmeAnalyses?: Array<{
    speed: number;
    type: string;
    note?: string;
  }>;
}

export interface SolarEnergeticParticle {
  sepID: string;
  eventTime: string;
  instruments: Array<{
    displayName: string;
  }>;
}

class NASAApiService {
  private getDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // Last 30 days
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }

  private async fetchData<T>(endpoint: string): Promise<T[]> {
    const { startDate, endDate } = this.getDateRange();
    const url = `${BASE_URL}/${endpoint}?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      return this.getMockData(endpoint);
    }
  }

  private getMockData(endpoint: string): any[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    switch (endpoint) {
      case 'FLR':
        return [
          {
            flrID: 'FLR-001',
            beginTime: yesterday.toISOString(),
            peakTime: new Date(yesterday.getTime() + 30 * 60 * 1000).toISOString(),
            classType: 'M2.1',
            sourceLocation: 'N14W28',
            activeRegionNum: 3421
          },
          {
            flrID: 'FLR-002',
            beginTime: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
            peakTime: new Date(now.getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
            classType: 'C5.3',
            sourceLocation: 'S08E42',
            activeRegionNum: 3422
          }
        ];
      case 'GST':
        return [
          {
            gstID: 'GST-001',
            startTime: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
            allKpIndex: [
              { observedTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), kpIndex: 5 }
            ]
          }
        ];
      case 'CME':
        return [
          {
            activityID: 'CME-001',
            startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
            sourceLocation: 'N15W30',
            note: 'Earth-directed CME',
            cmeAnalyses: [{ speed: 850, type: 'C', note: 'Moderate speed' }]
          }
        ];
      case 'SEP':
        return [
          {
            sepID: 'SEP-001',
            eventTime: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
            instruments: [{ displayName: 'GOES-16 SEISS' }]
          }
        ];
      default:
        return [];
    }
  }

  async getSolarFlares(): Promise<SolarFlare[]> {
    return this.fetchData<SolarFlare>('FLR');
  }

  async getGeomagneticStorms(): Promise<GeomagneticStorm[]> {
    return this.fetchData<GeomagneticStorm>('GST');
  }

  async getCMEs(): Promise<CME[]> {
    return this.fetchData<CME>('CME');
  }

  async getSolarEnergeticParticles(): Promise<SolarEnergeticParticle[]> {
    return this.fetchData<SolarEnergeticParticle>('SEP');
  }

  async getAllSpaceWeatherData() {
    const [flares, storms, cmes, particles] = await Promise.all([
      this.getSolarFlares(),
      this.getGeomagneticStorms(),
      this.getCMEs(),
      this.getSolarEnergeticParticles()
    ]);

    return { flares, storms, cmes, particles };
  }
}

export const nasaApi = new NASAApiService();