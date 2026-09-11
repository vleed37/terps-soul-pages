DO $$
DECLARE
  bak text := 'strains_wholesale_cols_backup_20260911';
BEGIN
  EXECUTE format('CREATE TABLE public.%I AS SELECT id, wholesale_box_price_zar, wholesale_minimum_boxes, wholesale_available, box_quantity, now() AS backed_up_at FROM public.strains', bak);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', bak);
  EXECUTE format('GRANT ALL ON public.%I TO service_role', bak);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', bak);
  EXECUTE format('CREATE POLICY "Admins can read wholesale backup" ON public.%I FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''))', bak);
END $$;

ALTER TABLE public.strains
  DROP COLUMN wholesale_box_price_zar,
  DROP COLUMN wholesale_minimum_boxes,
  DROP COLUMN wholesale_available,
  DROP COLUMN box_quantity;