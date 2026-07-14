export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          calorie_target: number | null
          protein_target: number | null
          target_weight: number | null
          target_body_fat: number | null
          timezone: string | null
          theme: 'light' | 'dark' | 'system'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          calorie_target?: number | null
          protein_target?: number | null
          target_weight?: number | null
          target_body_fat?: number | null
          timezone?: string | null
          theme?: 'light' | 'dark' | 'system'
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          calorie_target?: number | null
          protein_target?: number | null
          target_weight?: number | null
          target_body_fat?: number | null
          timezone?: string | null
          theme?: 'light' | 'dark' | 'system'
          updated_at?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          calories_consumed: number
          protein_grams: number
          total_calories_burned: number
          weight_kg: number | null
          body_fat_percentage: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          calories_consumed: number
          protein_grams: number
          total_calories_burned: number
          weight_kg?: number | null
          body_fat_percentage?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          calories_consumed?: number
          protein_grams?: number
          total_calories_burned?: number
          weight_kg?: number | null
          body_fat_percentage?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
