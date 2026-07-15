import { requireSupabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { DailyLog } from '@/types/models'

type DailyLogRow = Database['public']['Tables']['daily_logs']['Row']
type ExportPageLoader = (fromIndex: number, toIndex: number) => Promise<DailyLog[]>

const EXPORT_DAILY_LOG_COLUMNS = 'id,user_id,log_date,calories_consumed,protein_grams,total_calories_burned,weight_kg,body_fat_percentage,notes,created_at,updated_at'
export const EXPORT_PAGE_SIZE = 500

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
  if (!data.session?.user.id) throw new Error('An authenticated session is required to export daily logs.')
  return data.session.user.id
}

export async function accumulateExportPages(loadPage: ExportPageLoader, pageSize = EXPORT_PAGE_SIZE) {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('Export page size must be a positive integer.')
  const records: DailyLog[] = []

  for (let fromIndex = 0; ; fromIndex += pageSize) {
    const page = await loadPage(fromIndex, fromIndex + pageSize - 1)
    records.push(...page)
    if (page.length < pageSize) return records
  }
}

export async function fetchDailyLogsForExport(from: string | null, to: string) {
  const userId = await getAuthenticatedUserId()

  return accumulateExportPages(async (fromIndex, toIndex) => {
    let query = requireSupabase()
      .from('daily_logs')
      .select(EXPORT_DAILY_LOG_COLUMNS)
      .eq('user_id', userId)
      .lte('log_date', to)

    if (from) query = query.gte('log_date', from)

    const { data, error } = await query
      .order('log_date', { ascending: true })
      .order('id', { ascending: true })
      .range(fromIndex, toIndex)

    if (error) throw new Error(`Unable to load complete export data: ${error.message}`)
    return data.map(mapDailyLog)
  })
}
