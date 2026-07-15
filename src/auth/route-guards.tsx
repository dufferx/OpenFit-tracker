import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/components/common/loading-screen'
import { useAuth } from '@/auth/AuthContext'

export type LoginLocationState = {
  from?: string
  authError?: string
}

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen label="Loading your session" />
  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from } satisfies LoginLocationState} />
  }

  return <Outlet />
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen label="Loading your session" />
  if (user) return <Navigate to="/" replace />

  return children
}
