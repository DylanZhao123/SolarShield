-- Solar Flares Table
CREATE TABLE public.solar_flares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flare_id TEXT UNIQUE,
  class_type TEXT,
  source_location TEXT,
  begin_time TIMESTAMPTZ,
  peak_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geomagnetic Storms Table  
CREATE TABLE public.geomagnetic_storms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gst_id TEXT UNIQUE,
  start_time TIMESTAMPTZ,
  kp_index DECIMAL,
  observed_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CME Events Table
CREATE TABLE public.cme_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id TEXT UNIQUE,
  start_time TIMESTAMPTZ,
  source_location TEXT,
  speed DECIMAL,
  type TEXT,
  catalog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Status Table
CREATE TABLE public.system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_api_update TIMESTAMPTZ,
  total_flares INTEGER DEFAULT 0,
  total_storms INTEGER DEFAULT 0,
  total_cmes INTEGER DEFAULT 0,
  system_health TEXT DEFAULT 'online',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.solar_flares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geomagnetic_storms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cme_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a public monitoring system)
CREATE POLICY "Allow public read access on solar_flares" 
ON public.solar_flares FOR SELECT USING (true);

CREATE POLICY "Allow public read access on geomagnetic_storms" 
ON public.geomagnetic_storms FOR SELECT USING (true);

CREATE POLICY "Allow public read access on cme_events" 
ON public.cme_events FOR SELECT USING (true);

CREATE POLICY "Allow public read access on system_status" 
ON public.system_status FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_solar_flares_updated_at
  BEFORE UPDATE ON public.solar_flares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_geomagnetic_storms_updated_at
  BEFORE UPDATE ON public.geomagnetic_storms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cme_events_updated_at
  BEFORE UPDATE ON public.cme_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_status_updated_at
  BEFORE UPDATE ON public.system_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();