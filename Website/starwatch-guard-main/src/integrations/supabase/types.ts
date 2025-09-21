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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cme_events: {
        Row: {
          activity_id: string | null
          catalog: string | null
          created_at: string | null
          id: string
          source_location: string | null
          speed: number | null
          start_time: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          catalog?: string | null
          created_at?: string | null
          id?: string
          source_location?: string | null
          speed?: number | null
          start_time?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          catalog?: string | null
          created_at?: string | null
          id?: string
          source_location?: string | null
          speed?: number | null
          start_time?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      geomagnetic_storms: {
        Row: {
          created_at: string | null
          gst_id: string | null
          id: string
          kp_index: number | null
          observed_time: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gst_id?: string | null
          id?: string
          kp_index?: number | null
          observed_time?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gst_id?: string | null
          id?: string
          kp_index?: number | null
          observed_time?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          api_response_time: number | null
          device_info: Json | null
          id: string
          page_load_time: number | null
          rendering_time: number | null
          timestamp: string | null
          user_interactions: number | null
        }
        Insert: {
          api_response_time?: number | null
          device_info?: Json | null
          id?: string
          page_load_time?: number | null
          rendering_time?: number | null
          timestamp?: string | null
          user_interactions?: number | null
        }
        Update: {
          api_response_time?: number | null
          device_info?: Json | null
          id?: string
          page_load_time?: number | null
          rendering_time?: number | null
          timestamp?: string | null
          user_interactions?: number | null
        }
        Relationships: []
      }
      solar_flares: {
        Row: {
          begin_time: string | null
          class_type: string | null
          created_at: string | null
          end_time: string | null
          flare_id: string | null
          id: string
          peak_time: string | null
          source_location: string | null
          updated_at: string | null
        }
        Insert: {
          begin_time?: string | null
          class_type?: string | null
          created_at?: string | null
          end_time?: string | null
          flare_id?: string | null
          id?: string
          peak_time?: string | null
          source_location?: string | null
          updated_at?: string | null
        }
        Update: {
          begin_time?: string | null
          class_type?: string | null
          created_at?: string | null
          end_time?: string | null
          flare_id?: string | null
          id?: string
          peak_time?: string | null
          source_location?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      space_weather_cache: {
        Row: {
          cache_version: number | null
          cme_events: Json | null
          created_at: string | null
          data_type: string
          geomagnetic_storms: Json | null
          id: string
          last_updated: string | null
          processed_analytics: Json | null
          sep_events: Json | null
          solar_flares: Json | null
        }
        Insert: {
          cache_version?: number | null
          cme_events?: Json | null
          created_at?: string | null
          data_type: string
          geomagnetic_storms?: Json | null
          id?: string
          last_updated?: string | null
          processed_analytics?: Json | null
          sep_events?: Json | null
          solar_flares?: Json | null
        }
        Update: {
          cache_version?: number | null
          cme_events?: Json | null
          created_at?: string | null
          data_type?: string
          geomagnetic_storms?: Json | null
          id?: string
          last_updated?: string | null
          processed_analytics?: Json | null
          sep_events?: Json | null
          solar_flares?: Json | null
        }
        Relationships: []
      }
      system_status: {
        Row: {
          id: string
          last_api_update: string | null
          system_health: string | null
          total_cmes: number | null
          total_flares: number | null
          total_storms: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_api_update?: string | null
          system_health?: string | null
          total_cmes?: number | null
          total_flares?: number | null
          total_storms?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_api_update?: string | null
          system_health?: string | null
          total_cmes?: number | null
          total_flares?: number | null
          total_storms?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visualization_configs: {
        Row: {
          created_at: string | null
          id: string
          page_name: string
          parameters: Json | null
          updated_at: string | null
          user_customizations: Json | null
          viz_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_name: string
          parameters?: Json | null
          updated_at?: string | null
          user_customizations?: Json | null
          viz_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page_name?: string
          parameters?: Json | null
          updated_at?: string | null
          user_customizations?: Json | null
          viz_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
