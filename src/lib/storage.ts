import type { DailyLog, Profile } from '@/types/models'

const LOGS_KEY = 'openfit.logs'
const PROFILE_KEY = 'openfit.profile'

const seedLogs: DailyLog[] = Array.from({ length: 14 }, (_, index) => {
  const date = new Date()
  date.setDate(date.getDate() - (13 - index))
  return {
    id: crypto.randomUUID(),
    logDate: date.toISOString().slice(0, 10),
    caloriesConsumed: 1840 + ((index * 73) % 330),
    proteinGrams: 137 + ((index * 7) % 24),
    totalCaloriesBurned: 2240 + ((index * 41) % 260),
    weightKg: index % 2 === 0 ? Number((65.2 - index * 0.045).toFixed(2)) : undefined,
    bodyFatPercentage: index % 4 === 0 ? Number((17.4 - index * 0.035).toFixed(1)) : undefined,
  }
})

export const defaultProfile: Profile = {
  displayName: 'Fernando',
  calorieTarget: 2000,
  proteinTarget: 155,
  targetWeight: 62,
  targetBodyFat: 12,
  theme: 'system',
}

export function loadLogs(): DailyLog[] {
  const stored = localStorage.getItem(LOGS_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(LOGS_KEY, JSON.stringify(seedLogs))
  return seedLogs
}

export function saveLogs(logs: DailyLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function loadProfile(): Profile {
  const stored = localStorage.getItem(PROFILE_KEY)
  return stored ? JSON.parse(stored) : defaultProfile
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
