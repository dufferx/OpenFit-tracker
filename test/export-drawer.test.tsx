import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExportDrawer } from '@/components/export/export-drawer'
import { dailyLog, profile } from './fixtures'

const mocks = vi.hoisted(() => ({
  useExportDailyLogs: vi.fn(),
}))

vi.mock('@/hooks/use-daily-logs', () => ({ useExportDailyLogs: mocks.useExportDailyLogs }))
vi.mock('sileo', () => ({ sileo: { success: vi.fn(), error: vi.fn() } }))

describe('export drawer states', () => {
  afterEach(cleanup)

  beforeEach(() => vi.clearAllMocks())

  it('prefills the drawer from Progress and disables download while complete data is loading', async () => {
    mocks.useExportDailyLogs.mockReturnValue({ data: [dailyLog()], isPending: false, isFetching: true, isError: false })
    render(<ExportDrawer profile={profile({ timezone: 'America/El_Salvador' })} progressRange="90d" />)
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(await screen.findByText('Export data and reports')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Date range' })).toHaveTextContent('Last 90 days')
    expect(screen.getByRole('button', { name: /download csv/i })).toBeDisabled()
  })

  it('shows an honest empty state and disables export when no records exist', async () => {
    mocks.useExportDailyLogs.mockReturnValue({ data: [], isPending: false, isFetching: false, isError: false })
    render(<ExportDrawer profile={profile()} progressRange="30d" />)
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(await screen.findByText('No records in this range')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download csv/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('combobox', { name: 'Date range' }))
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="select-content"]')).toHaveAttribute('data-align-trigger', 'false')
  })
})
