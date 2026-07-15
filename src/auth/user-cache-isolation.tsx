import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { dailyLogKeys } from '@/hooks/use-daily-logs'
import { profileKeys } from '@/hooks/use-profile'

export function UserCacheIsolation() {
  const { user, isLoading } = useAuth()
  const queryClient = useQueryClient()
  const previousUserId = useRef<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    const nextUserId = user?.id ?? null
    const priorUserId = previousUserId.current
    if (priorUserId && priorUserId !== nextUserId) {
      queryClient.removeQueries({ queryKey: dailyLogKeys.user(priorUserId) })
      queryClient.removeQueries({ queryKey: profileKeys.user(priorUserId) })
    }
    previousUserId.current = nextUserId
  }, [isLoading, queryClient, user?.id])

  return null
}
