export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      stock_adjustments: {
        Row: {
          id: string;
          product_id: string;
          adjustment_type: string;
          quantity_change: number;
          quantity_before: number;
          quantity_after: number;
          notes: string | null;
          reference: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          adjustment_type: string;
          quantity_change: number;
          quantity_before: number;
          quantity_after: number;
          notes?: string | null;
          reference?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          notes?: string | null;
          reference?: string | null;
        };
        Relationships: [];
      };

      customer_stories: {
        Row: {
          body: string | null;
          created_at: string;
          customer_name: string;
          customer_role: string | null;
          id: string;
          image_url: string | null;
          quote: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          customer_name: string;
          customer_role?: string | null;
          id?: string;
          image_url?: string | null;
          quote: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          customer_name?: string;
          customer_role?: string | null;
          id?: string;
          image_url?: string | null;
          quote?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      journal_posts: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          read_time: string;
          sort_order: number;
          tag: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          read_time?: string;
          sort_order?: number;
          tag?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          read_time?: string;
          sort_order?: number;
          tag?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          subtitle: string;
          category: string;
          brand: string;
          price: number;
          original_price: number | null;
          rating: number;
          reviews_count: number;
          image_url: string;
          gallery: string[];
          description: string;
          in_stock: boolean;
          stock_count: number;
          featured: boolean;
          is_new: boolean;
          is_bestseller: boolean;
          attributes: Json;
          specs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          subtitle: string;
          category: string;
          brand: string;
          price: number;
          original_price?: number | null;
          rating?: number;
          reviews_count?: number;
          image_url: string;
          gallery?: string[];
          description: string;
          in_stock?: boolean;
          stock_count?: number;
          featured?: boolean;
          is_new?: boolean;
          is_bestseller?: boolean;
          attributes?: Json;
          specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subtitle?: string;
          category?: string;
          brand?: string;
          price?: number;
          original_price?: number | null;
          rating?: number;
          reviews_count?: number;
          image_url?: string;
          gallery?: string[];
          description?: string;
          in_stock?: boolean;
          stock_count?: number;
          featured?: boolean;
          is_new?: boolean;
          is_bestseller?: boolean;
          attributes?: Json;
          specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const;
