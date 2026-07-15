import { formatShortCalendarDate, inclusiveDateRange, type InclusiveDateRange } from '@/lib/calendar-date'
import { energyBalance, sortLogsChronologically, sortLogsNewestFirst } from '@/lib/daily-log-calculations'
import type { DailyLog } from '@/types/models'

export const PROGRESS_RANGES = [
  { value: '7d', label: '7 days', days: 7 },
  { value: '30d', label: '30 days', days: 30 },
  { value: '90d', label: '90 days', days: 90 },
  { value: 'all', label: 'All time', days: null },
] as const

export type ProgressRange = typeof PROGRESS_RANGES[number]['value']

export type ChartDataPoint = {
  logDate: string
  dateLabel: string
}

export type CaloriesChartPoint = ChartDataPoint & {
  caloriesConsumed: number
  totalCaloriesBurned: number
}

export type ProteinChartPoint = ChartDataPoint & {
  proteinGrams: number
}

export type WeightChartPoint = ChartDataPoint & {
  weightKg: number
}

export type BodyFatChartPoint = ChartDataPoint & {
  bodyFatPercentage: number
}

export type WeeklySummary = {
  loggedDays: number
  totalDays: 7
  averageCaloriesConsumed: number | null
  averageProteinGrams: number | null
  averageCaloriesBurned: number | null
  averageEnergyBalance: number | null
}

export function getProgressDateRange(range: ProgressRange, timeZone: string, instant = new Date()): InclusiveDateRange | null {
  const definition = PROGRESS_RANGES.find(option => option.value === range)
  return definition?.days ? inclusiveDateRange(timeZone, definition.days, instant) : null
}

export function filterLogsByDateRange(logs: DailyLog[], range: InclusiveDateRange) {
  return logs.filter(log => log.logDate >= range.from && log.logDate <= range.to)
}

function chartDate(logDate: string): ChartDataPoint {
  return { logDate, dateLabel: formatShortCalendarDate(logDate) }
}

export function createCaloriesChartData(logs: DailyLog[]): CaloriesChartPoint[] {
  return sortLogsChronologically(logs).map(log => ({
    ...chartDate(log.logDate),
    caloriesConsumed: log.caloriesConsumed,
    totalCaloriesBurned: log.totalCaloriesBurned,
  }))
}

export function createProteinChartData(logs: DailyLog[]): ProteinChartPoint[] {
  return sortLogsChronologically(logs).map(log => ({
    ...chartDate(log.logDate),
    proteinGrams: log.proteinGrams,
  }))
}

export function createWeightChartData(logs: DailyLog[], limit?: number): WeightChartPoint[] {
  const measurements = sortLogsNewestFirst(logs)
    .filter((log): log is DailyLog & { weightKg: number } => log.weightKg !== null)
  const selected = limit === undefined ? measurements : measurements.slice(0, limit)

  return sortLogsChronologically(selected).map(log => ({
    ...chartDate(log.logDate),
    weightKg: log.weightKg,
  }))
}

export function createBodyFatChartData(logs: DailyLog[]): BodyFatChartPoint[] {
  return sortLogsChronologically(logs)
    .filter((log): log is DailyLog & { bodyFatPercentage: number } => log.bodyFatPercentage !== null)
    .map(log => ({
      ...chartDate(log.logDate),
      bodyFatPercentage: log.bodyFatPercentage,
    }))
}

function average(values: number[]) {
  return values.length === 0 ? null : values.reduce((total, value) => total + value, 0) / values.length
}

export function calculateWeeklySummary(logs: DailyLog[], timeZone: string, instant = new Date()): WeeklySummary {
  const weeklyLogs = filterLogsByDateRange(logs, inclusiveDateRange(timeZone, 7, instant))

  return {
    loggedDays: weeklyLogs.length,
    totalDays: 7,
    averageCaloriesConsumed: average(weeklyLogs.map(log => log.caloriesConsumed)),
    averageProteinGrams: average(weeklyLogs.map(log => log.proteinGrams)),
    averageCaloriesBurned: average(weeklyLogs.map(log => log.totalCaloriesBurned)),
    averageEnergyBalance: average(weeklyLogs.map(energyBalance)),
  }
}
