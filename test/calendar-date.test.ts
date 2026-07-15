import { describe, expect, it } from 'vitest'
import {
  addCalendarDays,
  inclusiveDateRange,
  isFutureCalendarDate,
  parseCalendarDate,
  subtractCalendarDays,
  todayInTimeZone,
} from '@/lib/calendar-date'

const INSTANT = new Date('2026-07-15T04:30:00.000Z')

describe('calendar date and timezone helpers', () => {
  it('calculates today in the profile timezone around local midnight', () => {
    expect(todayInTimeZone('America/El_Salvador', INSTANT)).toBe('2026-07-14')
    expect(todayInTimeZone('Asia/Tokyo', INSTANT)).toBe('2026-07-15')
  })

  it('adds and subtracts calendar days without timezone shifting', () => {
    expect(addCalendarDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(subtractCalendarDays('2026-03-01', 1)).toBe('2026-02-28')
  })

  it.each([
    [7, '2026-07-08'],
    [30, '2026-06-15'],
    [90, '2026-04-16'],
  ])('creates an inclusive %i-day range', (days, from) => {
    expect(inclusiveDateRange('America/El_Salvador', days, INSTANT)).toEqual({ from, to: '2026-07-14' })
  })

  it('parses YYYY-MM-DD into calendar parts rather than a shifted Date', () => {
    expect(parseCalendarDate('2026-07-15')).toEqual({ year: 2026, month: 7, day: 15 })
    expect(parseCalendarDate('2026-02-30')).toBeNull()
  })

  it('rejects only dates after profile-local today', () => {
    expect(isFutureCalendarDate('2026-07-15', 'America/El_Salvador', INSTANT)).toBe(true)
    expect(isFutureCalendarDate('2026-07-14', 'America/El_Salvador', INSTANT)).toBe(false)
    expect(isFutureCalendarDate('not-a-date', 'America/El_Salvador', INSTANT)).toBe(false)
  })
})
