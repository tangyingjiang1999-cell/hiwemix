-- Migration: Add regions table and modify brands table
-- Date: 2026-07-16

-- 1. Create regions table
CREATE TABLE IF NOT EXISTS public.regions (
  code TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY regions_select_all ON public.regions
  FOR SELECT TO public
  USING (true);

-- 2. Insert default regions
INSERT INTO public.regions (code) VALUES
  ('JPN'), ('EUR'), ('USA'), ('CHN'), ('KOR')
ON CONFLICT (code) DO NOTHING;

-- 3. Modify brands table
-- First, drop the old CHECK constraint if it exists
ALTER TABLE public.brands
  DROP CONSTRAINT IF EXISTS brands_region_check;

-- Add foreign key constraint to regions table
ALTER TABLE public.brands
  ADD CONSTRAINT fk_brands_region
    FOREIGN KEY (region) REFERENCES public.regions(code)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

-- Add comment for documentation
COMMENT ON TABLE public.regions IS 'Brand origin/region lookup table';
COMMENT ON COLUMN public.regions.code IS 'Region code (e.g., JPN, EUR, USA)';
COMMENT ON CONSTRAINT fk_brands_region ON public.brands IS 'Foreign key to regions table';
