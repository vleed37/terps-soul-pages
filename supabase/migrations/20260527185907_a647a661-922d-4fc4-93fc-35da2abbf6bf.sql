
ALTER TABLE public.stockists
  ADD COLUMN IF NOT EXISTS product_listing_urls jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS accepts_online_orders boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.stockist_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  city_or_suburb text NOT NULL,
  province text,
  notes text,
  created_at timestamptz DEFAULT now()
);

GRANT INSERT ON public.stockist_requests TO anon, authenticated;
GRANT ALL ON public.stockist_requests TO service_role;

ALTER TABLE public.stockist_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stockist_requests_public_insert" ON public.stockist_requests
  FOR INSERT WITH CHECK (true);
