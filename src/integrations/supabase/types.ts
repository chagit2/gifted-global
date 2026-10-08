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
      coupons: {
        Row: {
          active: boolean
          amount: number
          code: string
          created_at: string
          expires_on: string | null
          kind: string
        }
        Insert: {
          active?: boolean
          amount: number
          code: string
          created_at?: string
          expires_on?: string | null
          kind: string
        }
        Update: {
          active?: boolean
          amount?: number
          code?: string
          created_at?: string
          expires_on?: string | null
          kind?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          letter: string
          order_id: string
          product_id: string
          product_name: string
          qty: number
          unit_price: number
        }
        Insert: {
          id?: string
          letter?: string
          order_id: string
          product_id: string
          product_name?: string
          qty?: number
          unit_price?: number
        }
        Update: {
          id?: string
          letter?: string
          order_id?: string
          product_id?: string
          product_name?: string
          qty?: number
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
        ]
      }
      orders: {
        Row: {
          admin_note: string
          coupon_code: string
          created_at: string
          currency: string
          customer_note: string
          delivery_date: string | null
          discount: number
          id: string
          language: string
          phone: string
          recipient_name: string
          recipient_phone: string
          sender_name: string
          ship_city: string
          ship_country: string
          ship_street: string
          ship_zip: string
          shipping_fee: number
          status: string
          total: number
          user_id: string | null
        }
        Insert: {
          admin_note?: string
          coupon_code?: string
          created_at?: string
          currency?: string
          customer_note?: string
          delivery_date?: string | null
          discount?: number
          id?: string
          language?: string
          phone: string
          recipient_name?: string
          recipient_phone?: string
          sender_name: string
          ship_city: string
          ship_country: string
          ship_street: string
          ship_zip: string
          shipping_fee?: number
          status?: string
          total?: number
          user_id?: string | null
        }
        Update: {
          admin_note?: string
          coupon_code?: string
          created_at?: string
          currency?: string
          customer_note?: string
          delivery_date?: string | null
          discount?: number
          id?: string
          language?: string
          phone?: string
          recipient_name?: string
          recipient_phone?: string
          sender_name?: string
          ship_city?: string
          ship_country?: string
          ship_street?: string
          ship_zip?: string
          shipping_fee?: number
          status?: string
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          categories: string[]
          category: string
          created_at: string
          description_en: string
          description_fr: string
          description_he: string
          id: string
          images: string[]
          in_stock: boolean
          name_en: string
          name_fr: string
          name_he: string
          price: number
          sort: number
          subtitle_en: string
          subtitle_fr: string
          subtitle_he: string
        }
        Insert: {
          active?: boolean
          categories?: string[]
          category: string
          created_at?: string
          description_en?: string
          description_fr?: string
          description_he?: string
          id?: string
          images?: string[]
          in_stock?: boolean
          name_en?: string
          name_fr?: string
          name_he?: string
          price: number
          sort?: number
          subtitle_en?: string
          subtitle_fr?: string
          subtitle_he?: string
        }
        Update: {
          active?: boolean
          categories?: string[]
          category?: string
          created_at?: string
          description_en?: string
          description_fr?: string
          description_he?: string
          id?: string
          images?: string[]
          in_stock?: boolean
          name_en?: string
          name_fr?: string
          name_he?: string
          price?: number
          sort?: number
          subtitle_en?: string
          subtitle_fr?: string
          subtitle_he?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          shipping_fee: number
        }
        Insert: {
          id?: number
          shipping_fee?: number
        }
        Update: {
          id?: number
          shipping_fee?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
