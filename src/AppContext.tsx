import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadLogs, loadProfile, saveLogs, saveProfile } from '@/lib/storage'
import type { DailyLog, Profile } from '@/types/models'

type AppContextValue = {
  logs: DailyLog[]
  profile: Profile
  upsertLog: (log: Omit<DailyLog, 'id'> & { id?: string }) => void
  deleteLog: (id: string) => void
  updateProfile: (profile: Profile) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<DailyLog[]>(loadLogs)
  const [profile, setProfile] = useState<Profile>(loadProfile)

  const value = useMemo<AppContextValue>(() => ({
    logs,
    profile,
    upsertLog(input) {
      setLogs(current => {
        const existing = current.find(log => log.logDate === input.logDate || log.id === input.id)
        const next = existing
          ? current.map(log => log.id === existing.id ? { ...log, ...input, id: existing.id } : log)
          : [...current, { ...input, id: crypto.randomUUID() }]
        const sorted = next.sort((a, b) => a.logDate.localeCompare(b.logDate))
        saveLogs(sorted)
        return sorted
      })
    },
    deleteLog(id) {
      setLogs(current => {
        const next = current.filter(log => log.id !== id)
        saveLogs(next)
        return next
      })
    },
    updateProfile(next) {
      setProfile(next)
      saveProfile(next)
    },
  }), [logs, profile])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
