import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { fetchProfile, upsertProfile } from '@/lib/profiles'

export const profileKeys = {
  all: ['profile'] as const,
  user: (userId: string) => [...profileKeys.all, userId] as const,
}

export function useProfile() {
  const { user, isLoading: isAuthLoading } = useAuth()
  return useQuery({
    queryKey: profileKeys.user(user?.id ?? 'signed-out'),
    queryFn: fetchProfile,
    enabled: !isAuthLoading && Boolean(user),
  })
}

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertProfile,
    onSuccess: profile => {
      if (user) queryClient.setQueryData(profileKeys.user(user.id), profile)
    },
  })
}
