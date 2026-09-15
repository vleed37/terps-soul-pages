-- 1. Review status enum
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Purchase verification helper (server-side only truth for "verified purchase")
CREATE OR REPLACE FUNCTION public.has_purchased_strain(_customer_id uuid, _strain_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.customer_id = _customer_id
      AND oi.strain_id = _strain_id
      AND o.payment_status = 'paid'
      AND o.status NOT IN ('cancelled', 'refunded')
  )
$$;

REVOKE ALL ON FUNCTION public.has_purchased_strain(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_purchased_strain(uuid, uuid) TO authenticated, service_role;

-- 3. Reviews table
CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  strain_id uuid NOT NULL REFERENCES public.strains(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 20 AND 2000),
  status public.review_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz,
  moderated_by uuid,
  moderation_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, strain_id)
);

CREATE INDEX product_reviews_strain_approved_idx
  ON public.product_reviews (strain_id, status, submitted_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.product_reviews TO authenticated;
GRANT SELECT ON public.product_reviews TO anon;
GRANT ALL ON public.product_reviews TO service_role;

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are publicly readable"
  ON public.product_reviews FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Customers can read their own review"
  ON public.product_reviews FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Admins and staff can read all reviews"
  ON public.product_reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Verified purchasers can submit their own review"
  ON public.product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid()
    AND status = 'pending'
    AND public.has_purchased_strain(auth.uid(), strain_id)
  );

CREATE POLICY "Customers can edit their own review"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can moderate reviews"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Sanitise, force pending on customer edits, rate limit
CREATE OR REPLACE FUNCTION public.product_reviews_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_moderator boolean := false;
  recent_count integer;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    is_moderator := public.has_role(auth.uid(), 'admin');
  END IF;

  -- Strip markup: reviews are stored and rendered as plain text.
  NEW.body := btrim(regexp_replace(NEW.body, '<[^>]*>', '', 'g'));

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.submitted_at := now();
    NEW.moderated_at := NULL;
    NEW.moderated_by := NULL;
    NEW.moderation_note := NULL;

    SELECT count(*) INTO recent_count
    FROM public.product_reviews
    WHERE customer_id = NEW.customer_id
      AND created_at > now() - interval '1 hour';
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'Too many reviews submitted recently. Please try again later.';
    END IF;
  ELSE
    NEW.updated_at := now();

    IF is_moderator OR auth.uid() IS NULL THEN
      -- Moderation path: status change allowed, trail recorded.
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.moderated_at := now();
        NEW.moderated_by := auth.uid();
      END IF;
    ELSE
      -- Customer edit: content changes return the review to pending.
      NEW.customer_id := OLD.customer_id;
      NEW.strain_id := OLD.strain_id;
      NEW.status := 'pending';
      NEW.submitted_at := now();
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;

      IF OLD.updated_at > now() - interval '1 minute' THEN
        RAISE EXCEPTION 'Please wait a moment before editing your review again.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER product_reviews_guard_trg
  BEFORE INSERT OR UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.product_reviews_guard();

-- 5. Review reports
CREATE TABLE public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 3 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.review_reports TO anon, authenticated;
GRANT ALL ON public.review_reports TO service_role;

ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report a review"
  ON public.review_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read reports"
  ON public.review_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Rating aggregates from approved reviews only
CREATE OR REPLACE FUNCTION public.strain_rating_summary(_strain_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'count', count(*),
    'average', CASE WHEN count(*) = 0 THEN NULL ELSE round(avg(rating)::numeric, 1) END,
    'breakdown', jsonb_build_object(
      '1', count(*) FILTER (WHERE rating = 1),
      '2', count(*) FILTER (WHERE rating = 2),
      '3', count(*) FILTER (WHERE rating = 3),
      '4', count(*) FILTER (WHERE rating = 4),
      '5', count(*) FILTER (WHERE rating = 5)
    )
  )
  FROM public.product_reviews
  WHERE strain_id = _strain_id AND status = 'approved'
$$;

REVOKE ALL ON FUNCTION public.strain_rating_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.strain_rating_summary(uuid) TO anon, authenticated, service_role;

-- 7. Private configuration (joints-sold baseline)
CREATE TABLE public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read config"
  ON public.app_config FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_config (key, value) VALUES ('joints_sold_baseline', '0');

-- 8. Joints sold aggregate: verified paid orders only, exposes a single number
CREATE OR REPLACE FUNCTION public.joints_sold_total()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  retail_units bigint := 0;
  wholesale_single bigint := 0;
  wholesale_mixed bigint := 0;
  baseline bigint := 0;
BEGIN
  SELECT COALESCE(sum(oi.quantity), 0) INTO retail_units
  FROM public.orders o
  JOIN public.order_items oi ON oi.order_id = o.id
  WHERE o.payment_status = 'paid'
    AND o.status NOT IN ('cancelled', 'refunded')
    AND o.order_number NOT LIKE 'FIXTURE%'
    AND o.order_number NOT LIKE 'TEST%';

  SELECT COALESCE(sum(woi.boxes_ordered * woi.box_quantity_per_unit), 0) INTO wholesale_single
  FROM public.wholesale_orders wo
  JOIN public.wholesale_order_items woi ON woi.wholesale_order_id = wo.id
  WHERE wo.payment_status = 'paid'
    AND wo.fulfillment_status <> 'cancelled'
    AND wo.order_number NOT LIKE 'FIXTURE%'
    AND wo.order_number NOT LIKE 'TEST%'
    AND woi.item_type = 'single_strain';

  SELECT COALESCE(sum(woi.boxes_ordered * comp_units), 0) INTO wholesale_mixed
  FROM public.wholesale_orders wo
  JOIN public.wholesale_order_items woi ON woi.wholesale_order_id = wo.id
  CROSS JOIN LATERAL (
    SELECT COALESCE(sum((c ->> 'units')::int), 0) AS comp_units
    FROM jsonb_array_elements(woi.box_composition) AS c
  ) comps
  WHERE wo.payment_status = 'paid'
    AND wo.fulfillment_status <> 'cancelled'
    AND wo.order_number NOT LIKE 'FIXTURE%'
    AND wo.order_number NOT LIKE 'TEST%'
    AND woi.item_type = 'mixed_box';

  SELECT COALESCE(NULLIF(value, '')::bigint, 0) INTO baseline
  FROM public.app_config WHERE key = 'joints_sold_baseline';

  RETURN COALESCE(baseline, 0) + retail_units + wholesale_single + wholesale_mixed;
END;
$$;

REVOKE ALL ON FUNCTION public.joints_sold_total() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.joints_sold_total() TO anon, authenticated, service_role;