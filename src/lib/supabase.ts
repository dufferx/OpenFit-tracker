import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

const missingVariables = [
  !supabaseUrl && 'VITE_SUPABASE_URL',
  !supabasePublishableKey && 'VITE_SUPABASE_PUBLISHABLE_KEY',
].filter((variable): variable is string => Boolean(variable))

export const supabaseConfigurationError = missingVariables.length > 0
  ? `Missing ${missingVariables.join(' and ')}. Copy .env.example to .env.local and add your Supabase project values.`
  : null

export const supabase: SupabaseClient<Database> | null = supabaseConfigurationError
  ? null
  : createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export function requireSupabase() {
  if (!supabase) {
    throw new Error(supabaseConfigurationError ?? 'Supabase is not configured.')
  }

  return supabase
}
