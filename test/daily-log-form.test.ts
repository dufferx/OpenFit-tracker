import { describe, expect, it } from 'vitest'
import { dailyLogSchema } from '@/lib/daily-log-form'

const schema = dailyLogSchema('America/El_Salvador', new Date('2026-07-15T18:00:00.000Z'))
const validValues = {
  logDate: '2026-07-15',
  caloriesConsumed: '0',
  proteinGrams: '0',
  totalCaloriesBurned: '0',
  weightKg: '',
  bodyFatPercentage: '',
  notes: '  ',
}

describe('daily log form normalization', () => {
  it('normalizes optional empty measurements and notes to null', () => {
    expect(schema.parse(validValues)).toEqual({
      logDate: '2026-07-15',
      caloriesConsumed: 0,
      proteinGrams: 0,
      totalCaloriesBurned: 0,
      weightKg: null,
      bodyFatPercentage: null,
      notes: null,
    })
  })

  it('preserves legitimate zeroes for allowed required totals', () => {
    const result = schema.parse(validValues)
    expect(result.caloriesConsumed).toBe(0)
    expect(result.proteinGrams).toBe(0)
    expect(result.totalCaloriesBurned).toBe(0)
  })

  it.each(['caloriesConsumed', 'proteinGrams', 'totalCaloriesBurned'] as const)('rejects an empty required %s', field => {
    expect(schema.safeParse({ ...validValues, [field]: '' }).success).toBe(false)
  })

  it('rejects non-finite values before transformation so NaN cannot reach persistence', () => {
    expect(schema.safeParse({ ...validValues, caloriesConsumed: 'NaN' }).success).toBe(false)
    expect(schema.safeParse({ ...validValues, weightKg: 'NaN' }).success).toBe(false)
  })

  it('rejects a future profile-local date', () => {
    expect(schema.safeParse({ ...validValues, logDate: '2026-07-16' }).success).toBe(false)
  })
})
