import { describe, expect, it } from 'vitest'
import { createBodyFatChartData, createCaloriesChartData, createProteinChartData, createWeightChartData } from '@/lib/progress-data'
import { dailyLog } from './fixtures'

const logs = [
  dailyLog({ logDate: '2026-07-15', weightKg: null, bodyFatPercentage: 18, caloriesConsumed: 2100, proteinGrams: 130 }),
  dailyLog({ logDate: '2026-07-13', weightKg: 81, bodyFatPercentage: null, caloriesConsumed: 1900, proteinGrams: 110 }),
  dailyLog({ logDate: '2026-07-14', weightKg: 80, bodyFatPercentage: 19, caloriesConsumed: 2000, proteinGrams: 120 }),
]

describe('progress data transformations', () => {
  it('excludes null weight and body-fat measurements', () => {
    expect(createWeightChartData(logs).map(point => point.weightKg)).toEqual([81, 80])
    expect(createBodyFatChartData(logs).map(point => point.bodyFatPercentage)).toEqual([19, 18])
  })

  it('keeps calorie and protein chart data chronological', () => {
    expect(createCaloriesChartData(logs).map(point => point.logDate)).toEqual(['2026-07-13', '2026-07-14', '2026-07-15'])
    expect(createProteinChartData(logs).map(point => point.logDate)).toEqual(['2026-07-13', '2026-07-14', '2026-07-15'])
  })

  it('leaves one measurement as one point for the existing UI to show as a non-trend state', () => {
    expect(createWeightChartData([dailyLog({ weightKg: 80 })])).toHaveLength(1)
  })
})
