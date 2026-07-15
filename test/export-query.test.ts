import { describe, expect, it, vi } from 'vitest'
import { accumulateExportPages } from '@/lib/export-query'
import { dailyLog } from './fixtures'

describe('export pagination', () => {
  it('accumulates every page in order until a short page is returned', async () => {
    const records = [
      dailyLog({ logDate: '2026-07-13' }),
      dailyLog({ logDate: '2026-07-14' }),
      dailyLog({ logDate: '2026-07-15' }),
    ]
    const loadPage = vi.fn(async (from: number, to: number) => records.slice(from, to + 1))

    await expect(accumulateExportPages(loadPage, 2)).resolves.toEqual(records)
    expect(loadPage).toHaveBeenNthCalledWith(1, 0, 1)
    expect(loadPage).toHaveBeenNthCalledWith(2, 2, 3)
  })

  it('requests a final empty page when the result exactly fills the preceding page', async () => {
    const records = [dailyLog({ logDate: '2026-07-14' }), dailyLog({ logDate: '2026-07-15' })]
    const loadPage = vi.fn(async (from: number, to: number) => records.slice(from, to + 1))

    await expect(accumulateExportPages(loadPage, 2)).resolves.toHaveLength(2)
    expect(loadPage).toHaveBeenLastCalledWith(2, 3)
  })
})
