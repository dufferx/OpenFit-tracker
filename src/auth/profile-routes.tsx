import { useEffect, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingScreen } from '@/components/common/loading-screen'
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
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground"><div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm"><h1 className="text-lg font-semibold">Unable to load your profile</h1><p role="alert" className="mt-2 text-sm text-destructive">{message}</p><Button variant="outline" className="mt-5" onClick={retry}>Try again</Button></div></main>
}
