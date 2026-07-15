import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '@/components/common/error-boundary'

function BrokenView({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Sensitive internal detail')
  return <p>Recovered view</p>
}

describe('ErrorBoundary', () => {
  it('shows a non-sensitive fallback and retries the render', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    let broken = true
    const { rerender } = render(<ErrorBoundary><BrokenView broken={broken} /></ErrorBoundary>)

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toHaveFocus()
    expect(screen.queryByText('Sensitive internal detail')).not.toBeInTheDocument()

    broken = false
    rerender(<ErrorBoundary><BrokenView broken={broken} /></ErrorBoundary>)
    screen.getByRole('button', { name: 'Try again' }).click()
    expect(await screen.findByText('Recovered view')).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
