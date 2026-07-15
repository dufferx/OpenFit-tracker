import { describe, expect, it } from 'vitest'
import { createProgressReportPdf } from '@/lib/pdf-report'
import { dailyLog, profile } from './fixtures'

describe('PDF progress report', () => {
  it('generates a non-empty PDF blob from real domain values and missing measurements', async () => {
    const blob = createProgressReportPdf(
      profile({ timezone: 'America/El_Salvador', targetWeight: 75, targetBodyFat: null }),
      [
        dailyLog({ logDate: '2026-07-14', weightKg: 80, bodyFatPercentage: null, notes: 'A long note is not rendered into the report table.' }),
        dailyLog({ logDate: '2026-07-15', weightKg: 79.5, bodyFatPercentage: 18 }),
      ],
      { id: '7d', from: '2026-07-09', to: '2026-07-15' },
      new Date('2026-07-15T20:00:00.000Z'),
    )

    expect(blob.type).toBe('application/pdf')
    expect(blob.size).toBeGreaterThan(1_000)
    const header = new TextDecoder().decode((await blob.arrayBuffer()).slice(0, 5))
    expect(header).toBe('%PDF-')
  })
})
