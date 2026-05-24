-- Schema changes
ALTER TABLE public.strains ADD COLUMN IF NOT EXISTS product_line text NOT NULL DEFAULT 'pre_roll'
  CHECK (product_line IN ('pre_roll', 'caviar_stix'));

ALTER TABLE public.strains ADD COLUMN IF NOT EXISTS product_tier text NOT NULL DEFAULT 'standard'
  CHECK (product_tier IN ('standard', 'premium'));

ALTER TABLE public.strains ADD COLUMN IF NOT EXISTS infusion_components text[];

ALTER TABLE public.strains ADD COLUMN IF NOT EXISTS strain_type text
  CHECK (strain_type IN ('sativa', 'hybrid', 'indica') OR strain_type IS NULL);

-- Update existing pre-rolls
UPDATE public.strains
SET product_line = 'pre_roll',
    product_tier = 'standard',
    infusion_components = ARRAY['Live Hash Rosin'],
    strain_type = CASE slug
      WHEN 'green-crack' THEN 'sativa'
      WHEN 'blue-dream' THEN 'hybrid'
      WHEN 'mango-sapphire' THEN 'hybrid'
      WHEN 'girl-scout-cookie' THEN 'indica'
      WHEN 'girl-scout-cookies' THEN 'indica'
      ELSE strain_type
    END
WHERE product_line = 'pre_roll';

-- Insert Caviar Stix products
INSERT INTO public.strains (
  slug, name, tagline, description, story,
  product_line, product_tier, strain_type,
  effect_category, flavor_tags,
  thc_percentage, cbd_percentage, total_terpenes_percentage,
  batch_number, test_date, lab_name, terpene_breakdown,
  price_zar, stock_quantity, weight_grams,
  infusion_components,
  accent_color_primary, accent_color_accent,
  is_active, is_featured, is_limited, display_order
) VALUES
(
  'caviar-stix-sativa',
  'Caviar Stix — Sativa',
  'The pinnacle of sativa craft.',
  'Premium indoor flower infused with hash, crumble, and live rosin. A sativa stix engineered for elevation.',
  'Caviar Stix represents the cream of the crop — the most premium expression of what Terps does. Each stix is built from indoor-grown premium flower, layered with hash, crumble, and live rosin. The sativa variant brings sharp clarity, lifted energy, and a smoothness that lingers.',
  'caviar_stix', 'premium', 'sativa',
  'daytime',
  ARRAY['Citrus', 'Pine', 'Earthy', 'Rich'],
  32.5, 0.4, 5.8,
  'TRP-CS-04-001', '2026-05-12', 'CannaLab SA',
  '[{"name":"Limonene","percentage":2.3,"descriptor":"Citrus brightness"},{"name":"Pinene","percentage":1.6,"descriptor":"Forest clarity"},{"name":"Myrcene","percentage":1.2,"descriptor":"Mango depth"}]'::jsonb,
  350.00, 18, 0.75,
  ARRAY['Premium Indoor Flower', 'Hash', 'Crumble', 'Live Rosin'],
  '#283526', '#A4B285',
  true, true, true, 10
),
(
  'caviar-stix-hybrid',
  'Caviar Stix — Hybrid',
  'The pinnacle of balanced craft.',
  'Premium indoor flower infused with hash, crumble, and live rosin. A hybrid stix engineered for versatility.',
  'Caviar Stix Hybrid is the daily driver of the premium tier — built for any moment, any session. Indoor flower at its peak, layered with the full spectrum of premium infusions. Versatile, deep, complete.',
  'caviar_stix', 'premium', 'hybrid',
  'balanced',
  ARRAY['Berry', 'Sweet', 'Earthy', 'Rich'],
  30.8, 0.6, 5.5,
  'TRP-CS-04-002', '2026-05-12', 'CannaLab SA',
  '[{"name":"Myrcene","percentage":2.1,"descriptor":"Berry depth"},{"name":"Caryophyllene","percentage":1.4,"descriptor":"Spicy warmth"},{"name":"Limonene","percentage":1.0,"descriptor":"Citrus lift"}]'::jsonb,
  350.00, 22, 0.75,
  ARRAY['Premium Indoor Flower', 'Hash', 'Crumble', 'Live Rosin'],
  '#2B3D52', '#B8C5D2',
  true, true, true, 11
),
(
  'caviar-stix-indica',
  'Caviar Stix — Indica',
  'The pinnacle of indica craft.',
  'Premium indoor flower infused with hash, crumble, and live rosin. An indica stix engineered for the slow-down.',
  'Caviar Stix Indica is built for the after-dinner sit-down. Premium indoor flower at its deepest expression, layered with hash, crumble, and live rosin. Rich, slow, profound.',
  'caviar_stix', 'premium', 'indica',
  'nighttime',
  ARRAY['Berry', 'Chocolate', 'Earthy', 'Rich'],
  33.1, 0.5, 6.0,
  'TRP-CS-04-003', '2026-05-12', 'CannaLab SA',
  '[{"name":"Caryophyllene","percentage":2.0,"descriptor":"Spicy warmth"},{"name":"Myrcene","percentage":1.8,"descriptor":"Deep mango"},{"name":"Humulene","percentage":1.1,"descriptor":"Earthy depth"}]'::jsonb,
  350.00, 14, 0.75,
  ARRAY['Premium Indoor Flower', 'Hash', 'Crumble', 'Live Rosin'],
  '#3D2A52', '#B89AC9',
  true, true, true, 12
)
ON CONFLICT (slug) DO NOTHING;