import type { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import { useAuth } from '@/auth/AuthContext'
import type { OnboardingLocationState } from '@/auth/profile-routes'
import { ProfileForm } from '@/components/profile/profile-form'
import { Button } from '@/components/ui/button'
import { useProfile, useUpdateProfile } from '@/hooks/use-profile'
import { safeAuthDestination } from '@/lib/auth-redirect'
import { getErrorMessage } from '@/lib/errors'
import { isProfileComplete } from '@/lib/profiles'
import type { ProfileInput } from '@/types/models'

export function Onboarding() {
  const { user } = useAuth()
  const profileQuery = useProfile()
  const updateProfile = useUpdateProfile()
  const { setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const destination = safeAuthDestination((location.state as OnboardingLocationState | null)?.from)
  const metadataDisplayName = user?.user_metadata.full_name
  const suggestedDisplayName = typeof metadataDisplayName === 'string' ? metadataDisplayName : user?.email?.split('@')[0] ?? ''

  if (profileQuery.isPending) return <OnboardingShell><p className="text-center text-sm text-muted-foreground" role="status">Loading your profile…</p></OnboardingShell>
  if (profileQuery.isError) return <OnboardingShell><div className="space-y-4 text-center"><p role="alert" className="text-sm text-destructive">{profileQuery.error.message}</p><Button variant="outline" onClick={() => void profileQuery.refetch()}>Try again</Button></div></OnboardingShell>
  if (isProfileComplete(profileQuery.data)) return <Navigate to="/" replace />

  const save = async (input: ProfileInput) => {
    try {
      await updateProfile.mutateAsync(input)
      setTheme(input.theme)
      sileo.success({ title: 'Profile ready', description: 'Your targets have been saved.' })
      navigate(destination, { replace: true })
    } catch (error) {
      sileo.error({ title: 'Unable to save profile', description: getErrorMessage(error) })
    }
  }

  return <OnboardingShell><ProfileForm profile={profileQuery.data} suggestedDisplayName={suggestedDisplayName} submitLabel="Complete setup" pendingLabel="Saving…" isPending={updateProfile.isPending} onSubmit={save} /></OnboardingShell>
}

function OnboardingShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-background px-4 py-10 text-foreground"><div className="mx-auto max-w-4xl"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Welcome to OpenFit</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Set your fitness targets</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Confirm the daily targets that will power your dashboard. You can change them later in Settings.</p></div>{children}</div></main>
}
