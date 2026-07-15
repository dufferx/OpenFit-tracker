import type { DailyLog, Profile } from '@/types/models'

export function dailyLog(overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    id: overrides.logDate ?? 'log-id',
    userId: 'user-id',
    logDate: '2026-07-15',
    caloriesConsumed: 2000,
    proteinGrams: 120,
    totalCaloriesBurned: 2200,
    weightKg: null,
    bodyFatPercentage: null,
    notes: null,
    createdAt: '2026-07-15T12:00:00Z',
    updatedAt: '2026-07-15T12:00:00Z',
    ...overrides,
  }
}

export function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-id',
    displayName: 'OpenFit User',
    calorieTarget: 2000,
    proteinTarget: 120,
    targetWeight: null,
    targetBodyFat: null,
    timezone: 'America/El_Salvador',
    theme: 'system',
    createdAt: '2026-07-15T12:00:00Z',
    updatedAt: '2026-07-15T12:00:00Z',
    ...overrides,
  }
}
