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

export type Profile = {
  displayName: string
  calorieTarget: number
  proteinTarget: number
  targetWeight?: number
  targetBodyFat?: number
  theme: 'light' | 'dark' | 'system'
}
