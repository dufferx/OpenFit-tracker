import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadProfile, saveProfile } from '@/lib/storage'
import type { Profile } from '@/types/models'

type AppContextValue = {
  profile: Profile
  updateProfile: (profile: Profile) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(loadProfile)

  const value = useMemo<AppContextValue>(() => ({
    profile,
    updateProfile(next) {
      setProfile(next)
      saveProfile(next)
    },
  }), [profile])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
