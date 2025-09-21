-- Add INSERT and UPDATE policies for solar_flares table
CREATE POLICY "Allow public insert access on solar_flares" ON public.solar_flares
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on solar_flares" ON public.solar_flares
FOR UPDATE USING (true);

-- Add INSERT and UPDATE policies for geomagnetic_storms table
CREATE POLICY "Allow public insert access on geomagnetic_storms" ON public.geomagnetic_storms
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on geomagnetic_storms" ON public.geomagnetic_storms
FOR UPDATE USING (true);

-- Add INSERT and UPDATE policies for cme_events table
CREATE POLICY "Allow public insert access on cme_events" ON public.cme_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on cme_events" ON public.cme_events
FOR UPDATE USING (true);

-- Add INSERT and UPDATE policies for system_status table
CREATE POLICY "Allow public insert access on system_status" ON public.system_status
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on system_status" ON public.system_status
FOR UPDATE USING (true);