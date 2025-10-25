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
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_predefined: boolean | null
          name: string
          org_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_predefined?: boolean | null
          name: string
          org_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_predefined?: boolean | null
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_join_requests: {
        Row: {
          created_at: string | null
          id: string
          org_id: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_join_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_join_requests_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by_user_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          default_org_id: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_org_id?: string | null
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_org_id?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_org_id_fkey"
            columns: ["default_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reporters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reporters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          category_id: string | null
          created_at: string
          days_taken: number
          id: string
          improvement_description: string | null
          org_id: string
          problem_description: string
          registration_numbers: string[]
          reporter_name: string | null
          technician_name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          days_taken: number
          id?: string
          improvement_description?: string | null
          org_id: string
          problem_description: string
          registration_numbers: string[]
          reporter_name?: string | null
          technician_name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          days_taken?: number
          id?: string
          improvement_description?: string | null
          org_id?: string
          problem_description?: string
          registration_numbers?: string[]
          reporter_name?: string | null
          technician_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technicians_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      org_report_stats: {
        Row: {
          avg_days_taken: number | null
          organization_id: string | null
          report_count: number | null
          technician_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_predefined: boolean | null
          name: string | null
          org_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_predefined?: boolean | null
          name?: string | null
          org_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_predefined?: boolean | null
          name?: string | null
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_reporters: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          org_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reporters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_reports: {
        Row: {
          category_id: string | null
          created_at: string | null
          days_taken: number | null
          id: string | null
          improvement_description: string | null
          org_id: string | null
          problem_description: string | null
          registration_numbers: string[] | null
          reporter_name: string | null
          technician_name: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          days_taken?: number | null
          id?: string | null
          improvement_description?: string | null
          org_id?: string | null
          problem_description?: string | null
          registration_numbers?: string[] | null
          reporter_name?: string | null
          technician_name?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          days_taken?: number | null
          id?: string | null
          improvement_description?: string | null
          org_id?: string | null
          problem_description?: string | null
          registration_numbers?: string[] | null
          reporter_name?: string | null
          technician_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_technicians: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          org_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_user_to_org: {
        Args: {
          p_org_id: string
          p_role?: Database["public"]["Enums"]["org_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      create_org: { Args: { p_name: string }; Returns: string }
      default_org_id_from_profile: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin_or_owner: {
        Args: { org: string; uid: string }
        Returns: boolean
      }
      is_org_member: { Args: { org: string; uid: string }; Returns: boolean }
      remove_user_from_org: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: undefined
      }
      transfer_org_ownership: {
        Args: { p_new_owner_id: string; p_org_id: string }
        Returns: undefined
      }
    }
    Enums: {
      org_role: "owner" | "admin" | "member"
      request_status: "pending" | "accepted" | "rejected"
      user_role: "admin" | "user"
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
    Enums: {
      org_role: ["owner", "admin", "member"],
      request_status: ["pending", "accepted", "rejected"],
      user_role: ["admin", "user"],
    },
  },
} as const
