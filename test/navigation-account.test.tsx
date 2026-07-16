import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Layout } from '@/components/Layout'
import { primaryNavigationItems } from '@/components/navigation'
import { GymLeaguePage } from '@/pages/GymLeague'

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
}))

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      email: 'alex@example.com',
      user_metadata: { full_name: 'Alex Rivers' },
    },
    isLoading: false,
    signOut: mocks.signOut,
  }),
}))

vi.mock('sileo', () => ({ sileo: { success: vi.fn(), error: vi.fn() } }))

function renderLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<h1>Dashboard route</h1>} />
          <Route path="log" element={<h1>Log route</h1>} />
          <Route path="history" element={<h1>History route</h1>} />
          <Route path="progress" element={<h1>Progress route</h1>} />
          <Route path="gym-league" element={<GymLeaguePage />} />
          <Route path="settings" element={<h1>Settings route</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('authenticated navigation and account access', () => {
  afterEach(cleanup)

  beforeEach(() => vi.clearAllMocks())

  it('uses Gym League in primary navigation instead of Settings', () => {
    renderLayout()

    expect(primaryNavigationItems.map(item => item.label)).toEqual(['Home', 'Progress', 'Log', 'History', 'Gym League'])
    expect(screen.getAllByRole('link', { name: 'Gym League' })).toHaveLength(2)
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })

  it('marks Gym League active without marking Settings as primary navigation', () => {
    renderLayout('/gym-league')

    expect(screen.getByRole('heading', { name: 'Gym League' })).toBeInTheDocument()
    for (const link of screen.getAllByRole('link', { name: 'Gym League' })) {
      expect(link).toHaveClass('bg-accent')
    }
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })

  it('keeps the direct Settings route accessible', () => {
    renderLayout('/settings')

    expect(screen.getByRole('heading', { name: 'Settings route' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })

  it('opens the account Drawer and navigates to Settings from it', async () => {
    renderLayout()

    fireEvent.click(screen.getAllByRole('button', { name: 'Open account menu' })[0])
    expect(await screen.findByRole('heading', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getAllByText('Alex Rivers').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('alex@example.com')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(await screen.findByRole('heading', { name: 'Settings route' })).toBeInTheDocument()
  })

  it('requires confirmation before signing out and cancel preserves the session', async () => {
    renderLayout()

    fireEvent.click(screen.getAllByRole('button', { name: 'Open account menu' })[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(await screen.findByRole('heading', { name: 'Sign out?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it('confirms sign out once and disables duplicate submission while pending', async () => {
    let resolveSignOut: () => void = () => undefined
    mocks.signOut.mockReturnValue(new Promise<void>(resolve => {
      resolveSignOut = resolve
    }))
    renderLayout()

    fireEvent.click(screen.getAllByRole('button', { name: 'Open account menu' })[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    const confirm = await screen.findByRole('button', { name: 'Sign out' })

    fireEvent.click(confirm)
    await waitFor(() => expect(confirm).toBeDisabled())
    fireEvent.click(confirm)

    expect(mocks.signOut).toHaveBeenCalledTimes(1)
    resolveSignOut()
  })
})

describe('Gym League placeholder', () => {
  afterEach(cleanup)

  it('renders concise placeholder copy without demo league data', () => {
    render(<GymLeaguePage />)

    expect(screen.getByRole('heading', { name: 'Gym League' })).toBeInTheDocument()
    expect(screen.getByText(/private attendance competitions between friends/i)).toBeInTheDocument()
    expect(screen.getByText('Gym League is coming soon')).toBeInTheDocument()
    expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument()
  })
})
