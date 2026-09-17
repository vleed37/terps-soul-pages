-- 1. Strain archiving (never delete strains referenced by historical orders)
ALTER TABLE public.strains
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- 2. Wholesale account suspension + geocoding metadata
ALTER TABLE public.wholesale_accounts
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS public_geocoded_at timestamptz,
  ADD COLUMN IF NOT EXISTS public_geocode_status text;

-- 3. Fulfilment timestamps
ALTER TABLE public.wholesale_orders
  ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz;

-- 4. Structural strain <-> terpene relationship
CREATE TABLE IF NOT EXISTS public.strain_terpenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strain_id uuid NOT NULL REFERENCES public.strains(id) ON DELETE CASCADE,
  terpene_id uuid NOT NULL REFERENCES public.terpenes(id) ON DELETE RESTRICT,
  prominence integer NOT NULL DEFAULT 0,
  percentage numeric,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (strain_id, terpene_id)
);

GRANT SELECT ON public.strain_terpenes TO anon;
GRANT SELECT ON public.strain_terpenes TO authenticated;
GRANT ALL ON public.strain_terpenes TO service_role;

ALTER TABLE public.strain_terpenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Strain terpenes are publicly readable" ON public.strain_terpenes;
CREATE POLICY "Strain terpenes are publicly readable"
  ON public.strain_terpenes FOR SELECT
  USING (true);

DROP TRIGGER IF EXISTS touch_strain_terpenes ON public.strain_terpenes;
CREATE TRIGGER touch_strain_terpenes
  BEFORE UPDATE ON public.strain_terpenes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS strain_terpenes_strain_idx ON public.strain_terpenes(strain_id);
CREATE INDEX IF NOT EXISTS strain_terpenes_terpene_idx ON public.strain_terpenes(terpene_id);

-- 5. Migrate the existing hand-maintained pairings (old data is left untouched)
INSERT INTO public.strain_terpenes (strain_id, terpene_id, prominence, percentage)
SELECT s.id,
       t.id,
       COALESCE(t.display_order, 0),
       (
         SELECT (b->>'percentage')::numeric
         FROM jsonb_array_elements(
           CASE WHEN jsonb_typeof(s.terpene_breakdown) = 'array'
                THEN s.terpene_breakdown ELSE '[]'::jsonb END
         ) AS b
         WHERE lower(btrim(b->>'name')) = lower(btrim(t.name))
         LIMIT 1
       )
FROM public.terpenes t
JOIN public.strains s ON s.slug = ANY (t.found_in_strain_slugs)
ON CONFLICT (strain_id, terpene_id) DO NOTHING;

-- Also capture terpenes named in a strain's own breakdown that were missing from the slug lists
INSERT INTO public.strain_terpenes (strain_id, terpene_id, prominence, percentage)
SELECT s.id, t.id, COALESCE(t.display_order, 0), (b->>'percentage')::numeric
FROM public.strains s
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(s.terpene_breakdown) = 'array' THEN s.terpene_breakdown ELSE '[]'::jsonb END
) AS b
JOIN public.terpenes t ON lower(btrim(t.name)) = lower(btrim(b->>'name'))
ON CONFLICT (strain_id, terpene_id) DO NOTHING;