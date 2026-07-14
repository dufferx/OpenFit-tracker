export type Database = {
  public: {
    Tables: {
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
