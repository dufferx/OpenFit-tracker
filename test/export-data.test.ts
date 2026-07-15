import { describe, expect, it } from 'vitest'
import {
  calculateExportSummary,
  createDailyLogsCsv,
  createJsonBackup,
  exportFilename,
  resolveExportRange,
  sanitizeFilename,
  serializeJsonBackup,
  toExportDailyLogs,
  validateCustomExportRange,
} from '@/lib/export-data'
import { dailyLog, profile } from './fixtures'

const INSTANT = new Date('2026-07-15T18:00:00.000Z')
const TIME_ZONE = 'America/El_Salvador'

describe('export date ranges', () => {
  it('resolves inclusive rolling and current-month boundaries in the profile timezone', () => {
    expect(resolveExportRange('7d', TIME_ZONE, {}, INSTANT)).toEqual({ id: '7d', from: '2026-07-09', to: '2026-07-15' })
    expect(resolveExportRange('current-month', TIME_ZONE, {}, INSTANT)).toEqual({ id: 'current-month', from: '2026-07-01', to: '2026-07-15' })
    expect(resolveExportRange('all', TIME_ZONE, {}, INSTANT)).toEqual({ id: 'all', from: null, to: '2026-07-15' })
  })

  it('validates custom boundaries and rejects future or reversed ranges', () => {
    expect(validateCustomExportRange('', '2026-07-15', '2026-07-15')).toMatch(/both/)
    expect(validateCustomExportRange('2026-07-15', '2026-07-14', '2026-07-15')).toMatch(/before/)
    expect(validateCustomExportRange('2026-07-14', '2026-07-16', '2026-07-15')).toMatch(/Future/)
    expect(validateCustomExportRange('2026-07-14', '2026-07-15', '2026-07-15')).toBeNull()
  })
})

describe('export calculations and transformations', () => {
  it('summarizes an empty range without inventing zero measurements or averages', () => {
    expect(calculateExportSummary([], { id: '7d', from: '2026-07-09', to: '2026-07-15' })).toEqual({
      loggedDays: 0,
      totalCalendarDays: 7,
      averageCaloriesConsumed: null,
      averageProteinGrams: null,
      averageCaloriesBurned: null,
      averageEstimatedBalance: null,
      latestWeightKg: null,
      latestBodyFatPercentage: null,
      minimumWeightKg: null,
      maximumWeightKg: null,
    })
  })

  it('retains legitimate zeroes and uses consumed minus burned for estimated balance', () => {
    const summary = calculateExportSummary([
      dailyLog({ logDate: '2026-07-14', caloriesConsumed: 0, proteinGrams: 0, totalCaloriesBurned: 0, weightKg: 0, bodyFatPercentage: 0 }),
      dailyLog({ logDate: '2026-07-15', caloriesConsumed: 1800, proteinGrams: 100, totalCaloriesBurned: 2300, weightKg: null, bodyFatPercentage: null }),
    ], { id: 'custom', from: '2026-07-14', to: '2026-07-15' })

    expect(summary.averageEstimatedBalance).toBe(-250)
    expect(summary.latestWeightKg).toBe(0)
    expect(summary.latestBodyFatPercentage).toBe(0)
    expect(summary.minimumWeightKg).toBe(0)
  })

  it('orders exported records chronologically without changing nulls', () => {
    const records = toExportDailyLogs([
      dailyLog({ logDate: '2026-07-15', weightKg: null }),
      dailyLog({ logDate: '2026-07-13', weightKg: 80 }),
    ])
    expect(records.map(record => record.date)).toEqual(['2026-07-13', '2026-07-15'])
    expect(records[1].weightKg).toBeNull()
  })
})

describe('CSV export', () => {
  it('escapes commas, quotes, multiline notes, and formula-like notes', () => {
    const csv = createDailyLogsCsv([
      dailyLog({ logDate: '2026-07-13', notes: 'Comma, "quote"\nand next line' }),
      dailyLog({ logDate: '2026-07-14', notes: '=HYPERLINK("bad")' }),
      dailyLog({ logDate: '2026-07-15', notes: '@command' }),
    ])
    expect(csv).toContain('"Comma, ""quote""\nand next line"')
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"')
    expect(csv).toContain("'@command")
    expect(csv).toContain('\r\n')
  })

  it('exports null optional values as empty cells and legitimate numeric zeroes as zero', () => {
    const [row] = createDailyLogsCsv([dailyLog({ caloriesConsumed: 0, proteinGrams: 0, totalCaloriesBurned: 0, weightKg: null, bodyFatPercentage: 0, notes: null })]).split('\r\n').slice(1)
    expect(row).toBe('2026-07-15,0,0,0,0,,0,')
  })
})

describe('JSON backup and filenames', () => {
  it('creates a readable versioned backup without IDs while preserving timestamps and nulls', () => {
    const backup = createJsonBackup(
      profile({ timezone: TIME_ZONE, targetWeight: null }),
      [dailyLog({ id: 'private-id', userId: 'private-user-id', weightKg: null })],
      { id: '7d', from: '2026-07-09', to: '2026-07-15' },
      new Date('2026-07-15T20:00:00.000Z'),
    )
    const json = serializeJsonBackup(backup)
    expect(backup.schemaVersion).toBe(1)
    expect(backup.exportedAt).toBe('2026-07-15T20:00:00.000Z')
    expect(backup.profile.targetWeightKg).toBeNull()
    expect(backup.dailyLogs[0].weightKg).toBeNull()
    expect(json).not.toContain('private-id')
    expect(json).not.toContain('userId')
    expect(json).toContain('\n  "schemaVersion": 1')
  })

  it('sanitizes stable English filenames', () => {
    expect(exportFilename('pdf', '2026-07-15')).toBe('openfit-progress-report-2026-07-15.pdf')
    expect(sanitizeFilename('../../My private report?.json')).toBe('My-private-report.json')
  })
})
