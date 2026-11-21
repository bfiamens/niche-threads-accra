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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          contact: string
          created_at: string
          handled: boolean
          id: string
          message: string
          name: string
        }
        Insert: {
          contact: string
          created_at?: string
          handled?: boolean
          id?: string
          message: string
          name: string
        }
        Update: {
          contact?: string
          created_at?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          locale: string
        }
        Insert: {
          consent: boolean
          created_at?: string
          email: string
          id?: string
          locale?: string
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          locale?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          product_id: string
          qty: number
          size: string
          unit_price: number
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          product_id: string
          qty: number
          size?: string
          unit_price: number
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          product_id?: string
          qty?: number
          size?: string
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
          address: string
          city: string
          created_at: string
          customer_name: string
          email: string
          id: string
          locale: string
          note: string
          order_no: number
          payment_method: string
          payment_reference: string
          phone: string
          region: string
          shipping: number
          status: string
          subtotal: number
          token: string
          total: number
          updated_at: string
          zone: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          customer_name: string
          email?: string
          id?: string
          locale?: string
          note?: string
          order_no?: number
          payment_method: string
          payment_reference?: string
          phone: string
          region: string
          shipping: number
          status?: string
          subtotal: number
          token?: string
          total: number
          updated_at?: string
          zone: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          locale?: string
          note?: string
          order_no?: number
          payment_method?: string
          payment_reference?: string
          phone?: string
          region?: string
          shipping?: number
          status?: string
          subtotal?: number
          token?: string
          total?: number
          updated_at?: string
          zone?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          arrives: string
          category: string
          color: string
          compare_at_ghs: number | null
          condition_notes: string
          created_at: string
          description_de: string
          description_en: string
          grade: string
          id: string
          image_url: string
          kind: string
          measurements: string
          name_de: string
          name_en: string
          needs_review: boolean
          preorder: boolean
          price_ghs: number
          published: boolean
          section: string
          sizes: string[]
          sort: number
          stock: number
          story_de: string
          story_en: string
          style_tags: string[]
        }
        Insert: {
          arrives?: string
          category?: string
          color?: string
          compare_at_ghs?: number | null
          condition_notes?: string
          created_at?: string
          description_de?: string
          description_en?: string
          grade?: string
          id: string
          image_url?: string
          kind?: string
          measurements?: string
          name_de?: string
          name_en: string
          needs_review?: boolean
          preorder?: boolean
          price_ghs: number
          published?: boolean
          section?: string
          sizes?: string[]
          sort?: number
          stock?: number
          story_de?: string
          story_en?: string
          style_tags?: string[]
        }
        Update: {
          arrives?: string
          category?: string
          color?: string
          compare_at_ghs?: number | null
          condition_notes?: string
          created_at?: string
          description_de?: string
          description_en?: string
          grade?: string
          id?: string
          image_url?: string
          kind?: string
          measurements?: string
          name_de?: string
          name_en?: string
          needs_review?: boolean
          preorder?: boolean
          price_ghs?: number
          published?: boolean
          section?: string
          sizes?: string[]
          sort?: number
          stock?: number
          story_de?: string
          story_en?: string
          style_tags?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          display_name: string
          id: string
          preferred_style: string
        }
        Insert: {
          display_name?: string
          id: string
          preferred_style?: string
        }
        Update: {
          display_name?: string
          id?: string
          preferred_style?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          city: string
          country: string
          created_at: string
          email: string
          id: string
          items: string
          name: string
          phone: string
          status: string
        }
        Insert: {
          city?: string
          country: string
          created_at?: string
          email: string
          id?: string
          items: string
          name: string
          phone?: string
          status?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          items?: string
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address: string
          bank_account_name: string
          bank_account_number: string
          bank_name: string
          checkout_open: boolean
          contact_email: string
          contact_phone: string
          contact_whatsapp: string
          delivery_options: string[]
          ghana_days: string
          ghana_fee: number
          id: number
          kumasi_days: string
          kumasi_fee: number
          momo_name: string
          momo_network: string
          momo_number: string
          policies: Json
          updated_at: string
        }
        Insert: {
          address?: string
          bank_account_name?: string
          bank_account_number?: string
          bank_name?: string
          checkout_open?: boolean
          contact_email?: string
          contact_phone?: string
          contact_whatsapp?: string
          delivery_options?: string[]
          ghana_days?: string
          ghana_fee?: number
          id?: number
          kumasi_days?: string
          kumasi_fee?: number
          momo_name?: string
          momo_network?: string
          momo_number?: string
          policies?: Json
          updated_at?: string
        }
        Update: {
          address?: string
          bank_account_name?: string
          bank_account_number?: string
          bank_name?: string
          checkout_open?: boolean
          contact_email?: string
          contact_phone?: string
          contact_whatsapp?: string
          delivery_options?: string[]
          ghana_days?: string
          ghana_fee?: number
          id?: number
          kumasi_days?: string
          kumasi_fee?: number
          momo_name?: string
          momo_network?: string
          momo_number?: string
          policies?: Json
          updated_at?: string
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
      find_order: {
        Args: { _order_no: number; _phone: string }
        Returns: string
      }
      get_order: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: { Args: { payload: Json }; Returns: Json }
      submit_payment_reference: {
        Args: { _ref: string; _token: string }
        Returns: undefined
      }
      subscribe_newsletter: {
        Args: { _consent: boolean; _email: string; _locale: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
