import { useEffect, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/components/common/loading-screen'
import { QueryErrorAlert } from '@/components/common/query-error-alert'
import { useProfile } from '@/hooks/use-profile'
import { isProfileComplete } from '@/lib/profiles'

export type OnboardingLocationState = {
  from?: string
}

export function ProfileThemeSync({ children }: { children: ReactNode }) {
  const profileQuery = useProfile()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (profileQuery.data?.theme) setTheme(profileQuery.data.theme)
  }, [profileQuery.data?.theme, setTheme])

  return children
}

export function CompleteProfileRoute() {
  const profileQuery = useProfile()
  const location = useLocation()

  if (profileQuery.isPending) return <LoadingScreen label="Loading your profile" />
  if (profileQuery.isError) return <ProfileLoadError message={profileQuery.error.message} retry={() => void profileQuery.refetch()} />
  if (!isProfileComplete(profileQuery.data)) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/onboarding" replace state={{ from } satisfies OnboardingLocationState} />
  }

  return <Outlet />
}

function ProfileLoadError({ message, retry }: { message: string; retry: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground"><QueryErrorAlert className="max-w-md bg-card p-6 shadow-sm" title="Unable to load your profile" message={message} retry={retry} /></main>
}
