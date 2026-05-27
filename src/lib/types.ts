export type Strain = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  story: string | null;
  effect_category: "daytime" | "balanced" | "nighttime" | null;
  flavor_tags: string[] | null;
  thc_percentage: number | null;
  cbd_percentage: number | null;
  total_terpenes_percentage: number | null;
  batch_number: string | null;
  test_date: string | null;
  lab_name: string | null;
  terpene_breakdown: Array<{ name: string; percentage: number; descriptor: string }> | null;
  price_zar: number;
  stock_quantity: number;
  weight_grams: number | null;
  accent_color_primary: string | null;
  accent_color_accent: string | null;
  is_featured: boolean | null;
  is_limited: boolean | null;
  display_order: number | null;
  product_line: "pre_roll" | "caviar_stix";
  product_tier: "standard" | "premium";
  strain_type: "sativa" | "hybrid" | "indica" | null;
  infusion_components: string[] | null;
};

export type Terpene = {
  id: string;
  slug: string;
  name: string;
  tastes_like: string | null;
  short_descriptor: string | null;
  long_description: string | null;
  found_in_strain_slugs: string[] | null;
  display_order: number | null;
};

export type Stockist = {
  id: string;
  slug: string;
  name: string;
  address: string;
  unit: string | null;
  suburb: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours_json: Record<string, { open: string; close: string }> | null;
  carried_strain_ids: string[] | null;
  is_featured: boolean | null;
  product_listing_urls?: Record<string, string> | null;
  accepts_online_orders?: boolean | null;
};

export const STRAIN_IMAGES: Record<string, { product: string; hero?: string }> = {};
