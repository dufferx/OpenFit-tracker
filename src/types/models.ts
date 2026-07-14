export type DailyLog = {
  id: string
  logDate: string
  caloriesConsumed: number
  proteinGrams: number
  totalCaloriesBurned: number
  weightKg?: number
  bodyFatPercentage?: number
  notes?: string
}

export type Profile = {
  displayName: string
  calorieTarget: number
  proteinTarget: number
  targetWeight?: number
  targetBodyFat?: number
  theme: 'light' | 'dark' | 'system'
}
