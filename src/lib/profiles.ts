import { requireSupabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Profile, ProfileInput } from '@/types/models'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const PROFILE_COLUMNS = 'id,display_name,calorie_target,protein_target,target_weight,target_body_fat,timezone,theme,created_at,updated_at'

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    calorieTarget: row.calorie_target,
    proteinTarget: row.protein_target,
    targetWeight: row.target_weight,
    targetBodyFat: row.target_body_fat,
    timezone: row.timezone,
    theme: row.theme,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getAuthenticatedUserId() {
  const { data, error } = await requireSupabase().auth.getSession()
  if (error) throw new Error(`Unable to read the authenticated session: ${error.message}`)
  if (!data.session?.user.id) throw new Error('An authenticated session is required to access the profile.')
  return data.session.user.id
}

export async function fetchProfile() {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(`Unable to load the profile: ${error.message}`)
  return data ? mapProfile(data) : null
}

export async function upsertProfile(input: ProfileInput) {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('profiles')
    .upsert({
      id: userId,
      display_name: input.displayName,
      calorie_target: input.calorieTarget,
      protein_target: input.proteinTarget,
      target_weight: input.targetWeight,
      target_body_fat: input.targetBodyFat,
      timezone: input.timezone,
      theme: input.theme,
    }, { onConflict: 'id' })
    .select(PROFILE_COLUMNS)
    .single()
  if (error) throw new Error(`Unable to save the profile: ${error.message}`)
  return mapProfile(data)
}

export function isProfileComplete(profile: Profile | null | undefined): profile is Profile & { calorieTarget: number; proteinTarget: number } {
  return Boolean(profile && profile.calorieTarget && profile.calorieTarget > 0 && profile.proteinTarget && profile.proteinTarget > 0)
}
