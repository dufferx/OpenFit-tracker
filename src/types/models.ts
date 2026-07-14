export type DailyLog = {
  id: string
  userId: string
  logDate: string
  caloriesConsumed: number
  proteinGrams: number
  totalCaloriesBurned: number
  weightKg: number | null
  bodyFatPercentage: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type DailyLogInput = Pick<DailyLog,
  | 'logDate'
  | 'caloriesConsumed'
  | 'proteinGrams'
  | 'totalCaloriesBurned'
  | 'weightKg'
  | 'bodyFatPercentage'
  | 'notes'
>

export type ThemePreference = 'light' | 'dark' | 'system'

export type Profile = {
  id: string
  displayName: string
  calorieTarget: number | null
  proteinTarget: number | null
  targetWeight: number | null
  targetBodyFat: number | null
  timezone: string
  theme: ThemePreference
  createdAt: string
  updatedAt: string
}

export type ProfileInput = Pick<Profile,
  | 'displayName'
  | 'calorieTarget'
  | 'proteinTarget'
  | 'targetWeight'
  | 'targetBodyFat'
  | 'timezone'
  | 'theme'
>
