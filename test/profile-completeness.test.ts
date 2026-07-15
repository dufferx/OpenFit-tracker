import { describe, expect, it } from 'vitest'
import { isProfileComplete } from '@/lib/profiles'
import { profile } from './fixtures'

describe('profile completeness', () => {
  it('requires a calorie target', () => {
    expect(isProfileComplete(profile({ calorieTarget: null }))).toBe(false)
  })

  it('requires a protein target', () => {
    expect(isProfileComplete(profile({ proteinTarget: null }))).toBe(false)
  })

  it('accepts a completed profile', () => {
    expect(isProfileComplete(profile())).toBe(true)
  })

  it.each([
    { calorieTarget: 0 },
    { calorieTarget: -1 },
    { proteinTarget: 0 },
    { proteinTarget: -1 },
  ])('rejects zero and negative targets: %o', targets => {
    expect(isProfileComplete(profile(targets))).toBe(false)
  })
})
