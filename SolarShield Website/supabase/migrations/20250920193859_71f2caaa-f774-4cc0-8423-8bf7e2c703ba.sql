-- Enhanced Supabase schema for comprehensive space weather caching and 3D visualizations

-- Comprehensive space weather cache table (only create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'space_weather_cache' AND table_schema = 'public') THEN
    CREATE TABLE public.space_weather_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      data_type TEXT NOT NULL,
      solar_flares JSONB,
      geomagnetic_storms JSONB,
      cme_events JSONB,
      sep_events JSONB,
      processed_analytics JSONB, -- Pre-computed statistics for fast loading
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      cache_version INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.space_weather_cache ENABLE ROW LEVEL SECURITY;

    -- Create policies for public access
    CREATE POLICY "Allow public read access on space_weather_cache" 
    ON public.space_weather_cache 
    FOR SELECT 
    USING (true);

    CREATE POLICY "Allow public insert access on space_weather_cache" 
    ON public.space_weather_cache 
    FOR INSERT 
    WITH CHECK (true);

    CREATE POLICY "Allow public update access on space_weather_cache" 
    ON public.space_weather_cache 
    FOR UPDATE 
    USING (true);
  END IF;
END $$;

-- 3D visualization configurations table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visualization_configs' AND table_schema = 'public') THEN
    CREATE TABLE public.visualization_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_name TEXT NOT NULL,
      viz_type TEXT NOT NULL,
      parameters JSONB DEFAULT '{}',
      user_customizations JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.visualization_configs ENABLE ROW LEVEL SECURITY;

    -- Create policies for visualization configs
    CREATE POLICY "Allow public read access on visualization_configs" 
    ON public.visualization_configs 
    FOR SELECT 
    USING (true);

    CREATE POLICY "Allow public insert access on visualization_configs" 
    ON public.visualization_configs 
    FOR INSERT 
    WITH CHECK (true);

    CREATE POLICY "Allow public update access on visualization_configs" 
    ON public.visualization_configs 
    FOR UPDATE 
    USING (true);
  END IF;
END $$;

-- Performance metrics table for monitoring
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics' AND table_schema = 'public') THEN
    CREATE TABLE public.performance_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_load_time DECIMAL,
      api_response_time DECIMAL,
      rendering_time DECIMAL,
      user_interactions INTEGER DEFAULT 0,
      device_info JSONB DEFAULT '{}',
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

    -- Create policies for performance metrics
    CREATE POLICY "Allow public insert access on performance_metrics" 
    ON public.performance_metrics 
    FOR INSERT 
    WITH CHECK (true);

    CREATE POLICY "Allow public read access on performance_metrics" 
    ON public.performance_metrics 
    FOR SELECT 
    USING (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_space_weather_cache_data_type ON public.space_weather_cache(data_type);
CREATE INDEX IF NOT EXISTS idx_space_weather_cache_last_updated ON public.space_weather_cache(last_updated);
CREATE INDEX IF NOT EXISTS idx_visualization_configs_page ON public.visualization_configs(page_name, viz_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);