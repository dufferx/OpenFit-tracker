import { describe, expect, it } from 'vitest'
import { energyBalance, latestMeasurement, sortLogsChronologically } from '@/lib/daily-log-calculations'
import { calculateWeeklySummary, filterLogsByDateRange } from '@/lib/progress-data'
import { dailyLog } from './fixtures'

const INSTANT = new Date('2026-07-15T18:00:00.000Z')

describe('dashboard and summary calculations', () => {
  it('filters the current seven calendar days inclusively', () => {
    const logs = [
      dailyLog({ logDate: '2026-07-08' }),
      dailyLog({ logDate: '2026-07-09' }),
      dailyLog({ logDate: '2026-07-15' }),
      dailyLog({ logDate: '2026-07-16' }),
    ]
    expect(filterLogsByDateRange(logs, { from: '2026-07-09', to: '2026-07-15' }).map(log => log.logDate)).toEqual(['2026-07-09', '2026-07-15'])
  })

  it('averages sparse weekly data while retaining legitimate zeroes', () => {
    const summary = calculateWeeklySummary([
      dailyLog({ logDate: '2026-07-10', caloriesConsumed: 0, proteinGrams: 0, totalCaloriesBurned: 100 }),
      dailyLog({ logDate: '2026-07-15', caloriesConsumed: 2000, proteinGrams: 100, totalCaloriesBurned: 2100 }),
      dailyLog({ logDate: '2026-07-01', caloriesConsumed: 9000 }),
    ], 'America/El_Salvador', INSTANT)

    expect(summary).toEqual({
      loggedDays: 2,
      totalDays: 7,
      averageCaloriesConsumed: 1000,
      averageProteinGrams: 50,
      averageCaloriesBurned: 1100,
      averageEnergyBalance: -100,
    })
  })

  it('calculates estimated energy balance', () => {
    expect(energyBalance(dailyLog({ caloriesConsumed: 1800, totalCaloriesBurned: 2300 }))).toBe(-500)
  })

  it('finds the latest non-null measurements independently', () => {
    const logs = [
      dailyLog({ logDate: '2026-07-15', weightKg: null, bodyFatPercentage: 18 }),
      dailyLog({ logDate: '2026-07-14', weightKg: 80, bodyFatPercentage: null }),
      dailyLog({ logDate: '2026-07-13', weightKg: 81, bodyFatPercentage: 19 }),
    ]
    expect(latestMeasurement(logs, 'weightKg')).toBe(80)
    expect(latestMeasurement(logs, 'bodyFatPercentage')).toBe(18)
  })

  it('sorts logs chronologically without mutating the input', () => {
    const logs = [dailyLog({ logDate: '2026-07-15' }), dailyLog({ logDate: '2026-07-13' })]
    expect(sortLogsChronologically(logs).map(log => log.logDate)).toEqual(['2026-07-13', '2026-07-15'])
    expect(logs.map(log => log.logDate)).toEqual(['2026-07-15', '2026-07-13'])
  })
})
