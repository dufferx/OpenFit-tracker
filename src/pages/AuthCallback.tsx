import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import type { LoginLocationState } from '@/auth/route-guards'
import { LoadingScreen } from '@/components/common/loading-screen'
import { consumeOAuthDestination } from '@/lib/auth-redirect'

function getOAuthError(searchParams: URLSearchParams) {
  const hashParams = new URLSearchParams(window.location.hash.slice(1))
  return searchParams.get('error_description')
    ?? hashParams.get('error_description')
    ?? searchParams.get('error')
    ?? hashParams.get('error')
}

export function AuthCallback() {
  const { user, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const [destination] = useState(consumeOAuthDestination)
  const authError = getOAuthError(searchParams)

  if (isLoading) return <LoadingScreen label="Completing sign in" />
  if (authError) return <Navigate to="/login" replace state={{ authError } satisfies LoginLocationState} />
  if (user) return <Navigate to={destination} replace />

  return <Navigate to="/login" replace state={{ authError: 'Unable to complete sign in. The link may have expired or already been used.' } satisfies LoginLocationState} />
}
