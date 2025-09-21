import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { nasaApi, SolarFlare, GeomagneticStorm, CME } from '@/services/nasaApi';

export interface SpaceWeatherData {
  flares: SolarFlare[];
  storms: GeomagneticStorm[];
  cmes: CME[];
  particles: any[];
  lastUpdate?: Date;
  isLoading: boolean;
}

export function useSpaceWeatherData() {
  const [data, setData] = useState<SpaceWeatherData>({
    flares: [],
    storms: [],
    cmes: [],
    particles: [],
    isLoading: true
  });

  // Load data from Supabase first, then NASA API
  const loadData = async () => {
    setData(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Try to load from Supabase first for better performance
      const [flareResult, stormResult, cmeResult] = await Promise.all([
        supabase.from('solar_flares').select('*').order('peak_time', { ascending: false }).limit(50),
        supabase.from('geomagnetic_storms').select('*').order('start_time', { ascending: false }).limit(50),
        supabase.from('cme_events').select('*').order('start_time', { ascending: false }).limit(50)
      ]);

      // If we have recent data in Supabase, use it
      const hasRecentData = flareResult.data?.length || stormResult.data?.length || cmeResult.data?.length;
      
      if (hasRecentData) {
        // Convert Supabase data to NASA API format
        const flares = flareResult.data?.map(f => ({
          flrID: f.flare_id || '',
          classType: f.class_type || '',
          sourceLocation: f.source_location || '',
          beginTime: f.begin_time || '',
          peakTime: f.peak_time || '',
          endTime: f.end_time || ''
        })) || [];

        const storms = stormResult.data?.map(s => ({
          gstID: s.gst_id || '',
          startTime: s.start_time || '',
          allKpIndex: [{
            observedTime: s.observed_time || '',
            kpIndex: Number(s.kp_index) || 0
          }]
        })) || [];

        const cmes = cmeResult.data?.map(c => ({
          activityID: c.activity_id || '',
          startTime: c.start_time || '',
          sourceLocation: c.source_location || '',
          cmeAnalyses: c.speed ? [{ speed: Number(c.speed), type: c.type || '', note: '' }] : []
        })) || [];

        setData({
          flares,
          storms,
          cmes,
          particles: [],
          lastUpdate: new Date(),
          isLoading: false
        });

        // Update from NASA API in background for fresh data
        updateFromNASA();
      } else {
        // No cached data, fetch from NASA API
        await updateFromNASA();
      }
    } catch (error) {
      console.error('Failed to load space weather data:', error);
      // Fallback to NASA API on error
      await updateFromNASA();
    }
  };

  const updateFromNASA = async () => {
    console.log('🚀 Starting NASA API fetch...');
    try {
      const nasaData = await nasaApi.getAllSpaceWeatherData();
      console.log('📡 NASA API data received:', {
        flares: nasaData.flares?.length || 0,
        storms: nasaData.storms?.length || 0,
        cmes: nasaData.cmes?.length || 0
      });
      
      setData({
        ...nasaData,
        lastUpdate: new Date(),
        isLoading: false
      });

      // Store fresh data in Supabase for future use
      console.log('💾 Storing data in Supabase...');
      await storeDataInSupabase(nasaData);
      console.log('✅ Data successfully stored in Supabase');
    } catch (error) {
      console.error('❌ Failed to fetch from NASA API:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const storeDataInSupabase = async (nasaData: any) => {
    console.log('🔄 Starting Supabase storage process...');
    try {
      // Store solar flares
      if (nasaData.flares?.length) {
        console.log(`📡 Storing ${nasaData.flares.length} solar flares...`);
        const flareData = nasaData.flares.map((flare: SolarFlare) => ({
          flare_id: flare.flrID,
          class_type: flare.classType,
          source_location: flare.sourceLocation,
          begin_time: flare.beginTime,
          peak_time: flare.peakTime,
          end_time: flare.endTime
        }));

        const { error: flareError } = await supabase.from('solar_flares').upsert(flareData, { 
          onConflict: 'flare_id',
          ignoreDuplicates: true 
        });
        
        if (flareError) {
          console.error('❌ Solar flares insert error:', flareError);
        } else {
          console.log('✅ Solar flares stored successfully');
        }
      }

      // Store geomagnetic storms
      if (nasaData.storms?.length) {
        console.log(`⚡ Storing ${nasaData.storms.length} geomagnetic storms...`);
        const stormData = nasaData.storms.flatMap((storm: GeomagneticStorm) => 
          storm.allKpIndex.map(kp => ({
            gst_id: `${storm.gstID}-${kp.observedTime}`,
            start_time: storm.startTime,
            kp_index: kp.kpIndex,
            observed_time: kp.observedTime
          }))
        );

        const { error: stormError } = await supabase.from('geomagnetic_storms').upsert(stormData, {
          onConflict: 'gst_id',
          ignoreDuplicates: true
        });
        
        if (stormError) {
          console.error('❌ Geomagnetic storms insert error:', stormError);
        } else {
          console.log('✅ Geomagnetic storms stored successfully');
        }
      }

      // Store CME events
      if (nasaData.cmes?.length) {
        console.log(`🌊 Storing ${nasaData.cmes.length} CME events...`);
        const cmeData = nasaData.cmes.map((cme: CME) => ({
          activity_id: cme.activityID,
          start_time: cme.startTime,
          source_location: cme.sourceLocation,
          speed: cme.cmeAnalyses?.[0]?.speed,
          type: cme.cmeAnalyses?.[0]?.type,
          catalog: 'NASA-DONKI'
        }));

        const { error: cmeError } = await supabase.from('cme_events').upsert(cmeData, {
          onConflict: 'activity_id', 
          ignoreDuplicates: true
        });
        
        if (cmeError) {
          console.error('❌ CME events insert error:', cmeError);
        } else {
          console.log('✅ CME events stored successfully');
        }
      }

      // Update system status
      console.log('📊 Updating system status...');
      const { error: statusError } = await supabase.from('system_status').upsert({
        id: '00000000-0000-0000-0000-000000000001',
        last_api_update: new Date().toISOString(),
        total_flares: nasaData.flares?.length || 0,
        total_storms: nasaData.storms?.length || 0,
        total_cmes: nasaData.cmes?.length || 0,
        system_health: 'online'
      }, { onConflict: 'id' });

      if (statusError) {
        console.error('❌ System status update error:', statusError);
      } else {
        console.log('✅ System status updated successfully');
      }

    } catch (error) {
      console.error('❌ Failed to store data in Supabase:', error);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up periodic refresh (reduced frequency)
    const interval = setInterval(loadData, 4 * 60 * 60 * 1000); // 4 hours
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...data,
    refresh: loadData,
    forceNASAUpdate: updateFromNASA
  };
}