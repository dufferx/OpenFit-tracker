import type { Profile } from '@/types/models'

const PROFILE_KEY = 'openfit.profile'

export const defaultProfile: Profile = {
  displayName: 'Fernando',
  calorieTarget: 2000,
  proteinTarget: 155,
  targetWeight: 62,
  targetBodyFat: 12,
  theme: 'system',
}

export function loadProfile(): Profile {
  const stored = localStorage.getItem(PROFILE_KEY)
  return stored ? JSON.parse(stored) : defaultProfile
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
