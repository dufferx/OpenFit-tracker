import type { DailyLog } from '@/types/models'

export type DailyLogNumericKey = 'caloriesConsumed' | 'proteinGrams' | 'totalCaloriesBurned'

export function sortLogsNewestFirst(logs: DailyLog[]) {
  return [...logs].sort((a, b) => b.logDate.localeCompare(a.logDate))
}

export function sortLogsChronologically(logs: DailyLog[]) {
  return [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate))
}

export function averageLogValue(logs: DailyLog[], key: DailyLogNumericKey) {
  if (logs.length === 0) return null
  return logs.reduce((total, log) => total + log[key], 0) / logs.length
}

export function energyBalance(log: DailyLog) {
  return log.caloriesConsumed - log.totalCaloriesBurned
}

export function latestMeasurement(logs: DailyLog[], key: 'weightKg' | 'bodyFatPercentage') {
  return sortLogsNewestFirst(logs).find(log => log[key] !== null)?.[key] ?? null
}
