import {
  inclusiveDateRange,
  isCalendarDate,
  parseCalendarDate,
  todayInTimeZone,
  type InclusiveDateRange,
} from '@/lib/calendar-date'
import { energyBalance, latestMeasurement, sortLogsChronologically } from '@/lib/daily-log-calculations'
import type { DailyLog, Profile } from '@/types/models'

export const EXPORT_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'current-month', label: 'Current month' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
] as const

export type ExportRangeId = typeof EXPORT_RANGE_OPTIONS[number]['value']
export type ExportFormat = 'csv' | 'json' | 'pdf'

export type ExportRange = {
  id: ExportRangeId
  from: string | null
  to: string
}

export type ExportSummary = {
  loggedDays: number
  totalCalendarDays: number
  averageCaloriesConsumed: number | null
  averageProteinGrams: number | null
  averageCaloriesBurned: number | null
  averageEstimatedBalance: number | null
  latestWeightKg: number | null
  latestBodyFatPercentage: number | null
  minimumWeightKg: number | null
  maximumWeightKg: number | null
}

export type ExportProfile = {
  displayName: string | null
  calorieTarget: number | null
  proteinTarget: number | null
  targetWeightKg: number | null
  targetBodyFatPercentage: number | null
  timezone: string
}

export type ExportDailyLog = {
  date: string
  caloriesConsumed: number
  proteinGrams: number
  totalCaloriesBurned: number
  estimatedBalance: number
  weightKg: number | null
  bodyFatPercentage: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type OpenFitBackup = {
  schemaVersion: 1
  exportedAt: string
  application: 'OpenFit Tracker'
  range: {
    from: string | null
    to: string
    timezone: string
  }
  profile: ExportProfile
  summary: ExportSummary
  dailyLogs: ExportDailyLog[]
}

export function validateCustomExportRange(from: string, to: string, today: string) {
  if (!from || !to) return 'Choose both a start and end date.'
  if (!isCalendarDate(from) || !isCalendarDate(to)) return 'Enter valid calendar dates.'
  if (from > to) return 'The end date cannot be before the start date.'
  if (from > today || to > today) return 'Future dates cannot be exported.'
  return null
}

export function resolveExportRange(
  id: ExportRangeId,
  timeZone: string,
  custom: Partial<InclusiveDateRange> = {},
  instant = new Date(),
): ExportRange {
  const today = todayInTimeZone(timeZone, instant)
  if (id === 'all') return { id, from: null, to: today }
  if (id === 'custom') {
    const from = custom.from ?? ''
    const to = custom.to ?? ''
    const error = validateCustomExportRange(from, to, today)
    if (error) throw new Error(error)
    return { id, from, to }
  }
  if (id === 'current-month') return { id, from: `${today.slice(0, 7)}-01`, to: today }

  const days = Number(id.slice(0, -1))
  return { id, ...inclusiveDateRange(timeZone, days, instant) }
}

export function calendarDayCount(from: string, to: string) {
  const start = parseCalendarDate(from)
  const end = parseCalendarDate(to)
  if (!start || !end || from > to) return 0
  const startTime = Date.UTC(start.year, start.month - 1, start.day)
  const endTime = Date.UTC(end.year, end.month - 1, end.day)
  return Math.round((endTime - startTime) / 86_400_000) + 1
}

function average(values: number[]) {
  return values.length === 0 ? null : values.reduce((total, value) => total + value, 0) / values.length
}

export function calculateExportSummary(logs: DailyLog[], range: ExportRange): ExportSummary {
  const ordered = sortLogsChronologically(logs)
  const weights = ordered.flatMap(log => log.weightKg === null ? [] : [log.weightKg])
  const rangeStart = range.from ?? ordered[0]?.logDate ?? null

  return {
    loggedDays: ordered.length,
    totalCalendarDays: rangeStart ? calendarDayCount(rangeStart, range.to) : 0,
    averageCaloriesConsumed: average(ordered.map(log => log.caloriesConsumed)),
    averageProteinGrams: average(ordered.map(log => log.proteinGrams)),
    averageCaloriesBurned: average(ordered.map(log => log.totalCaloriesBurned)),
    averageEstimatedBalance: average(ordered.map(energyBalance)),
    latestWeightKg: latestMeasurement(ordered, 'weightKg'),
    latestBodyFatPercentage: latestMeasurement(ordered, 'bodyFatPercentage'),
    minimumWeightKg: weights.length ? Math.min(...weights) : null,
    maximumWeightKg: weights.length ? Math.max(...weights) : null,
  }
}

export function toExportDailyLogs(logs: DailyLog[]): ExportDailyLog[] {
  return sortLogsChronologically(logs).map(log => ({
    date: log.logDate,
    caloriesConsumed: log.caloriesConsumed,
    proteinGrams: log.proteinGrams,
    totalCaloriesBurned: log.totalCaloriesBurned,
    estimatedBalance: energyBalance(log),
    weightKg: log.weightKg,
    bodyFatPercentage: log.bodyFatPercentage,
    notes: log.notes,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  }))
}

function csvCell(value: string | number | null, protectFormula = false) {
  if (value === null) return ''
  let text = String(value)
  if (protectFormula && /^[=+\-@]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function createDailyLogsCsv(logs: DailyLog[]) {
  const header = [
    'date',
    'calories_consumed',
    'protein_grams',
    'total_calories_burned',
    'estimated_balance',
    'weight_kg',
    'body_fat_percentage',
    'notes',
  ]
  const rows = toExportDailyLogs(logs).map(log => [
    csvCell(log.date),
    csvCell(log.caloriesConsumed),
    csvCell(log.proteinGrams),
    csvCell(log.totalCaloriesBurned),
    csvCell(log.estimatedBalance),
    csvCell(log.weightKg),
    csvCell(log.bodyFatPercentage),
    csvCell(log.notes, true),
  ].join(','))
  return [header.join(','), ...rows].join('\r\n')
}

export function createJsonBackup(
  profile: Profile & { timezone: string },
  logs: DailyLog[],
  range: ExportRange,
  exportedAt = new Date(),
): OpenFitBackup {
  return {
    schemaVersion: 1,
    exportedAt: exportedAt.toISOString(),
    application: 'OpenFit Tracker',
    range: { from: range.from, to: range.to, timezone: profile.timezone },
    profile: {
      displayName: profile.displayName || null,
      calorieTarget: profile.calorieTarget,
      proteinTarget: profile.proteinTarget,
      targetWeightKg: profile.targetWeight,
      targetBodyFatPercentage: profile.targetBodyFat,
      timezone: profile.timezone,
    },
    summary: calculateExportSummary(logs, range),
    dailyLogs: toExportDailyLogs(logs),
  }
}

export function serializeJsonBackup(backup: OpenFitBackup) {
  return `${JSON.stringify(backup, null, 2)}\n`
}

export function sanitizeFilename(value: string) {
  const sanitized = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/-+/g, '-')
    .replace(/-+\./g, '.')
    .replace(/^[.-]+|[.-]+$/g, '')
  return sanitized || 'openfit-export'
}

export function exportFilename(format: ExportFormat, date: string) {
  const stem = format === 'csv' ? 'openfit-daily-logs' : format === 'json' ? 'openfit-backup' : 'openfit-progress-report'
  return sanitizeFilename(`${stem}-${date}.${format}`)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  try {
    anchor.href = url
    anchor.download = sanitizeFilename(filename)
    anchor.hidden = true
    document.body.append(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}
