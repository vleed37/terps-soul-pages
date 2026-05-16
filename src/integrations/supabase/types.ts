export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          added_at: string | null
          cart_id: string | null
          id: string
          quantity: number
          strain_id: string | null
        }
        Insert: {
          added_at?: string | null
          cart_id?: string | null
          id?: string
          quantity: number
          strain_id?: string | null
        }
        Update: {
          added_at?: string | null
          cart_id?: string | null
          id?: string
          quantity?: number
          strain_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          session_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          line_total: number
          order_id: string | null
          quantity: number
          strain_id: string | null
          strain_name: string
          strain_slug: string
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          order_id?: string | null
          quantity: number
          strain_id?: string | null
          strain_name: string
          strain_slug: string
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          order_id?: string | null
          quantity?: number
          strain_id?: string | null
          strain_name?: string
          strain_slug?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bobpay_reference: string | null
          bobpay_transaction_id: string | null
          collect_stockist_id: string | null
          created_at: string | null
          customer_id: string | null
          delivery_address: Json | null
          delivery_fee: number
          delivery_method: string | null
          discount: number
          estimated_delivery_date: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          ip_address: string | null
          notes: string | null
          order_number: string
          payment_completed_at: string | null
          payment_method: string | null
          payment_status: string
          status: string
          subtotal: number
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          bobpay_reference?: string | null
          bobpay_transaction_id?: string | null
          collect_stockist_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_fee?: number
          delivery_method?: string | null
          discount?: number
          estimated_delivery_date?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          ip_address?: string | null
          notes?: string | null
          order_number: string
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_status?: string
          status?: string
          subtotal: number
          total: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          bobpay_reference?: string | null
          bobpay_transaction_id?: string | null
          collect_stockist_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_fee?: number
          delivery_method?: string | null
          discount?: number
          estimated_delivery_date?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          ip_address?: string | null
          notes?: string | null
          order_number?: string
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_status?: string
          status?: string
          subtotal?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_collect_stockist_id_fkey"
            columns: ["collect_stockist_id"]
            isOneToOne: false
            referencedRelation: "stockists"
            referencedColumns: ["id"]
          },
        ]
      }
      restock_notifications: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notified: boolean | null
          strain_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notified?: boolean | null
          strain_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notified?: boolean | null
          strain_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restock_notifications_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      stockists: {
        Row: {
          address: string
          carried_strain_ids: string[] | null
          city: string
          created_at: string | null
          email: string | null
          hours_json: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          province: string
          slug: string
          suburb: string | null
          unit: string | null
          website: string | null
        }
        Insert: {
          address: string
          carried_strain_ids?: string[] | null
          city: string
          created_at?: string | null
          email?: string | null
          hours_json?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          province: string
          slug: string
          suburb?: string | null
          unit?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          carried_strain_ids?: string[] | null
          city?: string
          created_at?: string | null
          email?: string | null
          hours_json?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string
          slug?: string
          suburb?: string | null
          unit?: string | null
          website?: string | null
        }
        Relationships: []
      }
      strains: {
        Row: {
          accent_color_accent: string | null
          accent_color_primary: string | null
          batch_number: string | null
          cbd_percentage: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          effect_category: string | null
          flavor_tags: string[] | null
          gallery_image_urls: string[] | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_limited: boolean | null
          lab_name: string | null
          name: string
          price_zar: number
          product_image_url: string | null
          slug: string
          stock_quantity: number
          story: string | null
          tagline: string | null
          terpene_breakdown: Json | null
          test_date: string | null
          thc_percentage: number | null
          total_terpenes_percentage: number | null
          updated_at: string | null
          weight_grams: number | null
          wholesale_price_zar: number | null
        }
        Insert: {
          accent_color_accent?: string | null
          accent_color_primary?: string | null
          batch_number?: string | null
          cbd_percentage?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          effect_category?: string | null
          flavor_tags?: string[] | null
          gallery_image_urls?: string[] | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_limited?: boolean | null
          lab_name?: string | null
          name: string
          price_zar?: number
          product_image_url?: string | null
          slug: string
          stock_quantity?: number
          story?: string | null
          tagline?: string | null
          terpene_breakdown?: Json | null
          test_date?: string | null
          thc_percentage?: number | null
          total_terpenes_percentage?: number | null
          updated_at?: string | null
          weight_grams?: number | null
          wholesale_price_zar?: number | null
        }
        Update: {
          accent_color_accent?: string | null
          accent_color_primary?: string | null
          batch_number?: string | null
          cbd_percentage?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          effect_category?: string | null
          flavor_tags?: string[] | null
          gallery_image_urls?: string[] | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_limited?: boolean | null
          lab_name?: string | null
          name?: string
          price_zar?: number
          product_image_url?: string | null
          slug?: string
          stock_quantity?: number
          story?: string | null
          tagline?: string | null
          terpene_breakdown?: Json | null
          test_date?: string | null
          thc_percentage?: number | null
          total_terpenes_percentage?: number | null
          updated_at?: string | null
          weight_grams?: number | null
          wholesale_price_zar?: number | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          source?: string | null
        }
        Relationships: []
      }
      terpenes: {
        Row: {
          display_order: number | null
          flavor_icon_url: string | null
          found_in_strain_slugs: string[] | null
          id: string
          long_description: string | null
          name: string
          short_descriptor: string | null
          slug: string
          tastes_like: string | null
        }
        Insert: {
          display_order?: number | null
          flavor_icon_url?: string | null
          found_in_strain_slugs?: string[] | null
          id?: string
          long_description?: string | null
          name: string
          short_descriptor?: string | null
          slug: string
          tastes_like?: string | null
        }
        Update: {
          display_order?: number | null
          flavor_icon_url?: string | null
          found_in_strain_slugs?: string[] | null
          id?: string
          long_description?: string | null
          name?: string
          short_descriptor?: string | null
          slug?: string
          tastes_like?: string | null
        }
        Relationships: []
      }
      wholesale_inquiries: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: { p_qty: number; p_strain_id: string }
        Returns: undefined
      }
      generate_order_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
