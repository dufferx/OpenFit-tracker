import { requireSupabase } from '@/lib/supabase'
import type { DailyLog, DailyLogInput } from '@/types/models'
import type { Database } from '@/types/database'

type DailyLogRow = Database['public']['Tables']['daily_logs']['Row']
type DailyLogInsert = Database['public']['Tables']['daily_logs']['Insert']
type DailyLogUpdate = Database['public']['Tables']['daily_logs']['Update']

const DAILY_LOG_COLUMNS = 'id,user_id,log_date,calories_consumed,protein_grams,total_calories_burned,weight_kg,body_fat_percentage,notes,created_at,updated_at'

function mapDailyLog(row: DailyLogRow): DailyLog {
  return {
    id: row.id,
    userId: row.user_id,
    logDate: row.log_date,
    caloriesConsumed: row.calories_consumed,
    proteinGrams: row.protein_grams,
    totalCaloriesBurned: row.total_calories_burned,
    weightKg: row.weight_kg,
    bodyFatPercentage: row.body_fat_percentage,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getAuthenticatedUserId() {
  const { data, error } = await requireSupabase().auth.getSession()
  if (error) throw new Error(`Unable to read the authenticated session: ${error.message}`)
  if (!data.session?.user.id) throw new Error('An authenticated session is required to access daily logs.')
  return data.session.user.id
}

function toInsert(input: DailyLogInput, userId: string): DailyLogInsert {
  return {
    user_id: userId,
    log_date: input.logDate,
    calories_consumed: input.caloriesConsumed,
    protein_grams: input.proteinGrams,
    total_calories_burned: input.totalCaloriesBurned,
    weight_kg: input.weightKg,
    body_fat_percentage: input.bodyFatPercentage,
    notes: input.notes,
  }
}

function toUpdate(input: DailyLogInput): DailyLogUpdate {
  return {
    log_date: input.logDate,
    calories_consumed: input.caloriesConsumed,
    protein_grams: input.proteinGrams,
    total_calories_burned: input.totalCaloriesBurned,
    weight_kg: input.weightKg,
    body_fat_percentage: input.bodyFatPercentage,
    notes: input.notes,
  }
}

export async function fetchDailyLogs() {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('daily_logs')
    .select(DAILY_LOG_COLUMNS)
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
  if (error) throw new Error(`Unable to load daily logs: ${error.message}`)
  return data.map(mapDailyLog)
}

export async function fetchDailyLogsByRange(from: string, to: string) {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('daily_logs')
    .select(DAILY_LOG_COLUMNS)
    .eq('user_id', userId)
    .gte('log_date', from)
    .lte('log_date', to)
    .order('log_date', { ascending: false })
  if (error) throw new Error(`Unable to load daily logs for the selected range: ${error.message}`)
  return data.map(mapDailyLog)
}

export async function fetchDailyLogByDate(logDate: string) {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('daily_logs')
    .select(DAILY_LOG_COLUMNS)
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .maybeSingle()
  if (error) throw new Error(`Unable to load the daily log: ${error.message}`)
  return data ? mapDailyLog(data) : null
}

export async function createDailyLog(input: DailyLogInput) {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('daily_logs')
    .insert(toInsert(input, userId))
    .select(DAILY_LOG_COLUMNS)
    .single()
  if (error) throw new Error(`Unable to create the daily log: ${error.message}`)
  return mapDailyLog(data)
}

export async function updateDailyLog(id: string, input: DailyLogInput) {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('daily_logs')
    .update(toUpdate(input))
    .eq('id', id)
    .eq('user_id', userId)
    .select(DAILY_LOG_COLUMNS)
    .single()
  if (error) throw new Error(`Unable to update the daily log: ${error.message}`)
  return mapDailyLog(data)
}

export async function upsertDailyLog(input: DailyLogInput) {
  const userId = await getAuthenticatedUserId()
  const { data, error } = await requireSupabase()
    .from('daily_logs')
    .upsert(toInsert(input, userId), { onConflict: 'user_id,log_date' })
    .select(DAILY_LOG_COLUMNS)
    .single()
  if (error) throw new Error(`Unable to save the daily log: ${error.message}`)
  return mapDailyLog(data)
}

export async function deleteDailyLog(id: string) {
  const userId = await getAuthenticatedUserId()
  const { error } = await requireSupabase()
    .from('daily_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(`Unable to delete the daily log: ${error.message}`)
}
