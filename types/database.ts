// Database types for Verkstads Insikt Supabase tables

export interface Profile {
  id: string
  user_id: string
  name: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  color: string | null
  is_predefined: boolean | null
  created_by_user_id: string | null
  created_at: string
}

export interface Technician {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export interface Reporter {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  technician_name: string
  registration_numbers: string[]
  days_taken: number
  problem_description: string
  improvement_description: string | null
  category_id: string | null
  reporter_name: string | null
  created_by_user_id: string | null
  created_at: string
}

// Extended types with relations
export interface ReportWithRelations extends Report {
  categories?: Category | null
}

// Form data types (for creating/updating records)
export interface CreateReportData {
  technician_name: string
  registration_numbers: string[]
  days_taken: number
  problem_description: string
  improvement_description?: string | null
  category_id?: string | null
  reporter_name?: string | null
  created_by_user_id?: string | null
}

export interface UpdateReportData extends Partial<CreateReportData> {
  id: string
}

export interface CreateCategoryData {
  name: string
  description?: string | null
  color?: string | null
  is_predefined?: boolean | null
  created_by_user_id?: string | null
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

export interface CreateTechnicianData {
  name: string
  description?: string | null
  is_active?: boolean
  created_by_user_id?: string | null
}

export interface UpdateTechnicianData extends Partial<CreateTechnicianData> {
  id: string
}

export interface CreateReporterData {
  name: string
  description?: string | null
  is_active?: boolean
  created_by_user_id?: string | null
}

export interface UpdateReporterData extends Partial<CreateReporterData> {
  id: string
}

export interface CreateProfileData {
  user_id: string
  name: string
  role?: 'admin' | 'user'
}

export interface UpdateProfileData extends Partial<CreateProfileData> {
  id: string
}

export interface UpdateUserRoleData {
  id: string
  role: 'admin' | 'user'
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
      }
      reports: {
        Row: Report
      }
      categories: {
        Row: Category
      }
      technicians: {
        Row: Technician
      }
      reporters: {
        Row: Reporter
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
