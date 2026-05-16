
-- Strains
create table public.strains (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  story text,
  effect_category text check (effect_category in ('daytime', 'balanced', 'nighttime')),
  flavor_tags text[],
  thc_percentage numeric(5,2),
  cbd_percentage numeric(5,2),
  total_terpenes_percentage numeric(5,2),
  batch_number text,
  test_date date,
  lab_name text,
  terpene_breakdown jsonb,
  price_zar numeric(10,2) not null default 180.00,
  wholesale_price_zar numeric(10,2),
  stock_quantity int not null default 0,
  weight_grams numeric(6,2) default 0.75,
  hero_image_url text,
  product_image_url text,
  gallery_image_urls text[],
  accent_color_primary text,
  accent_color_accent text,
  is_active boolean default true,
  is_featured boolean default false,
  is_limited boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.strains enable row level security;
create policy "strains_public_read" on public.strains for select using (is_active = true);

create table public.terpenes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tastes_like text,
  short_descriptor text,
  long_description text,
  flavor_icon_url text,
  found_in_strain_slugs text[],
  display_order int default 0
);
alter table public.terpenes enable row level security;
create policy "terpenes_public_read" on public.terpenes for select using (true);

create table public.stockists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  address text not null,
  unit text,
  suburb text,
  city text not null,
  province text not null,
  postal_code text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  phone text,
  email text,
  website text,
  hours_json jsonb,
  carried_strain_ids uuid[],
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.stockists enable row level security;
create policy "stockists_public_read" on public.stockists for select using (is_active = true);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text default 'homepage',
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.subscribers enable row level security;
create policy "subscribers_insert" on public.subscribers for insert with check (true);

create table public.restock_notifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  strain_id uuid references public.strains(id),
  notified boolean default false,
  created_at timestamptz default now()
);
alter table public.restock_notifications enable row level security;
create policy "restock_insert" on public.restock_notifications for insert with check (true);

create table public.wholesale_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_name text,
  email text not null,
  phone text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);
alter table public.wholesale_inquiries enable row level security;
create policy "wholesale_inquiries_insert" on public.wholesale_inquiries for insert with check (true);

create index idx_strains_slug on public.strains(slug);
create index idx_strains_active on public.strains(is_active);
create index idx_stockists_location on public.stockists(latitude, longitude);

-- Seed strains
insert into public.strains (slug, name, tagline, description, story, effect_category, flavor_tags, thc_percentage, cbd_percentage, total_terpenes_percentage, batch_number, test_date, lab_name, terpene_breakdown, price_zar, stock_quantity, accent_color_primary, accent_color_accent, is_featured, display_order) values
('green-crack', 'Green Crack', 'Sharp citrus, no slowdown.', 'Clear-headed. Focused. Built for daytime.', 'Green Crack is the one when you have things to do. Sharp citrus on the inhale, fast-acting clarity, and a flavor profile that actually delivers. No haze, no fog — just the lift.', 'daytime', ARRAY['Sharp citrus', 'Earthy', 'Pine'], 28.4, 0.6, 4.2, 'TRP-04-001', '2026-05-12', 'CannaLab SA', '[{"name":"Limonene","percentage":1.8,"descriptor":"Citrus brightness"},{"name":"Myrcene","percentage":1.1,"descriptor":"Herbal mango"},{"name":"Pinene","percentage":0.6,"descriptor":"Forest clarity"}]'::jsonb, 180.00, 47, '#1F3A2A', '#6CC840', true, 1),
('blue-dream', 'Blue Dream', 'Smooth, balanced, always in rotation.', 'Sweet berry notes with the perfect in-between.', 'Blue Dream is the drop you reach for when you don''t know what you want. Sweet berry on the front, mellow in the body. Any time, any mood, any session.', 'balanced', ARRAY['Sweet berry', 'Vanilla', 'Earthy'], 24.8, 0.4, 3.8, 'TRP-04-002', '2026-05-12', 'CannaLab SA', '[{"name":"Myrcene","percentage":1.5,"descriptor":"Berry sweetness"},{"name":"Pinene","percentage":0.9,"descriptor":"Light forest"},{"name":"Caryophyllene","percentage":0.7,"descriptor":"Spicy depth"}]'::jsonb, 180.00, 62, '#1F4A7A', '#B8D6E8', true, 2),
('mango-sapphire', 'Mango Sapphire', 'Juicy, tropical, way too smooth.', 'Flavor that lingers. Made for slowing down.', 'Mango Sapphire is your weekend in a pre-roll. Bright tropical on the front, mellow on the back, and a finish you won''t forget.', 'balanced', ARRAY['Mango', 'Tropical', 'Citrus'], 26.1, 0.5, 4.5, 'TRP-04-003', '2026-05-12', 'CannaLab SA', '[{"name":"Myrcene","percentage":1.9,"descriptor":"Tropical mango"},{"name":"Limonene","percentage":1.4,"descriptor":"Bright citrus"},{"name":"Terpinolene","percentage":0.5,"descriptor":"Floral lift"}]'::jsonb, 180.00, 35, '#B85F1A', '#E8B85A', true, 3),
('girl-scout-cookie', 'Girl Scout Cookie', 'Sweet, rich, deep.', 'Chocolate-chip notes wrapped in premium goodness.', 'Girl Scout Cookie is comfort, dialed up. Built for the after-dinner sit-down. Sweet, rich, smooth.', 'nighttime', ARRAY['Sweet', 'Chocolate', 'Earthy'], 29.7, 0.7, 4.0, 'TRP-04-004', '2026-05-12', 'CannaLab SA', '[{"name":"Caryophyllene","percentage":1.6,"descriptor":"Spicy warmth"},{"name":"Limonene","percentage":1.2,"descriptor":"Citrus undertone"},{"name":"Humulene","percentage":0.8,"descriptor":"Earthy depth"}]'::jsonb, 180.00, 28, '#2E2218', '#B89870', true, 4);

insert into public.terpenes (slug, name, tastes_like, short_descriptor, long_description, found_in_strain_slugs, display_order) values
('limonene', 'Limonene', 'citrus', 'Bright, lifted, sharp', 'The terpene behind that sharp citrus pop. Found in citrus peels and the brightest cannabis strains. Associated with mood lift and focus.', ARRAY['green-crack','mango-sapphire','girl-scout-cookie'], 1),
('myrcene', 'Myrcene', 'mango / herbal', 'Tropical, sweet, mellow', 'The most common cannabis terpene. Earthy, slightly tropical, behind the smooth body feel of many balanced strains.', ARRAY['green-crack','blue-dream','mango-sapphire'], 2),
('pinene', 'Pinene', 'pine / forest', 'Sharp, fresh, clarifying', 'Smells exactly like its name — fresh pine forest. Associated with mental clarity and alertness.', ARRAY['green-crack','blue-dream'], 3),
('caryophyllene', 'Caryophyllene', 'pepper / spice', 'Warm, peppery, grounding', 'The only terpene that interacts directly with cannabinoid receptors. Spicy, peppery, earthy.', ARRAY['blue-dream','girl-scout-cookie'], 4),
('linalool', 'Linalool', 'lavender / floral', 'Soft, floral, calming', 'The terpene behind lavender''s smell. Linked to calm and relaxation.', ARRAY[]::text[], 5),
('humulene', 'Humulene', 'hops / earthy', 'Earthy, hoppy, woody', 'Found in hops, basil, and certain heavy strains. Earthy and slightly bitter.', ARRAY['girl-scout-cookie'], 6),
('terpinolene', 'Terpinolene', 'floral / tropical', 'Bright, complex, uplifting', 'A complex terpene that brings floral, fruity, and slightly piney notes.', ARRAY['mango-sapphire'], 7),
('ocimene', 'Ocimene', 'sweet herbs', 'Sweet, herbal, light', 'Light, sweet, herbal. Found in mint, parsley, and certain energizing strains.', ARRAY[]::text[], 8);

insert into public.stockists (slug, name, address, suburb, city, province, latitude, longitude, phone, hours_json, is_featured, is_active) values
('divine-collective-camps-bay', 'The Divine Collective — Camps Bay', '12 Victoria Road', 'Camps Bay', 'Cape Town', 'Western Cape', -33.9510, 18.3776, '+27 21 555 0101', '{"mon":{"open":"10:00","close":"20:00"},"sun":{"open":"12:00","close":"18:00"}}'::jsonb, true, true),
('herb-house-sea-point', 'Herb House — Sea Point', '88 Main Road', 'Sea Point', 'Cape Town', 'Western Cape', -33.9166, 18.3835, '+27 21 555 0202', '{"mon":{"open":"09:00","close":"19:00"},"sun":{"open":"10:00","close":"17:00"}}'::jsonb, true, true),
('the-greenroom-sandton', 'The Greenroom — Sandton', 'Shop 14, Nelson Mandela Square', 'Sandton', 'Johannesburg', 'Gauteng', -26.1076, 28.0567, '+27 11 555 0303', '{"mon":{"open":"10:00","close":"20:00"},"sun":{"open":"12:00","close":"18:00"}}'::jsonb, true, true),
('terp-bar-rosebank', 'Terp Bar — Rosebank', '50 Tyrwhitt Avenue', 'Rosebank', 'Johannesburg', 'Gauteng', -26.1453, 28.0419, '+27 11 555 0404', '{"mon":{"open":"11:00","close":"21:00"},"sun":{"open":"12:00","close":"19:00"}}'::jsonb, false, true),
('flavor-room-durban', 'Flavor Room — Durban', '23 Florida Road', 'Morningside', 'Durban', 'KwaZulu-Natal', -29.8294, 31.0156, '+27 31 555 0505', '{"mon":{"open":"10:00","close":"19:00"},"sun":{"open":"closed","close":"closed"}}'::jsonb, false, true),
('the-pre-roll-co-pretoria', 'The Pre-Roll Co. — Pretoria', '156 Lynnwood Road', 'Brooklyn', 'Pretoria', 'Gauteng', -25.7672, 28.2331, '+27 12 555 0606', '{"mon":{"open":"09:00","close":"18:00"},"sun":{"open":"closed","close":"closed"}}'::jsonb, false, true);
