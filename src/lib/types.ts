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
  effects?: string[] | null;
  helps_with?: string[] | null;
  negatives?: string[] | null;
  lineage?: string | null;
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

export type WholesaleAccount = {
  id: string;
  user_id: string;
  business_name: string;
  trading_as: string | null;
  vat_number: string | null;
  cipc_registration_number: string | null;
  business_type: "dispensary" | "lounge" | "specialty_retailer" | "other";
  estimated_monthly_volume: "under_50" | "50_to_200" | "200_to_500" | "500_plus";
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  business_address_line_1: string;
  business_address_line_2: string | null;
  business_city: string;
  business_province: string;
  business_postal_code: string | null;
  business_country: string;
  approval_status: "pending" | "approved" | "rejected" | "suspended";
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export type WholesaleStrain = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  strain_type: "sativa" | "hybrid" | "indica" | null;
  product_line: "pre_roll" | "caviar_stix";
  product_image_url: string | null;
  accent_color_primary: string | null;
  box_quantity: number;
  wholesale_box_price_zar: number;
  wholesale_minimum_boxes: number;
  wholesale_available: boolean;
  weight_grams: number | null;
};

export type WholesaleOrderItem = {
  id: string;
  strain_id: string;
  strain_name: string;
  box_quantity_per_unit: number;
  boxes_ordered: number;
  total_units: number;
  unit_price_zar: number;
  box_price_zar: number;
  line_total_zar: number;
};

export type WholesaleOrder = {
  id: string;
  order_number: string;
  subtotal_zar: number;
  vat_zar: number;
  shipping_zar: number;
  total_zar: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  fulfillment_status: "pending" | "preparing" | "shipped" | "delivered" | "cancelled";
  shipping_address: {
    line1: string;
    line2?: string | null;
    city: string;
    province: string;
    postal_code?: string | null;
    country: string;
  };
  customer_notes: string | null;
  tracking_number: string | null;
  bobpay_transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  items?: WholesaleOrderItem[];
};
