import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { clearOAuthDestination, rememberOAuthDestination } from '@/lib/auth-redirect'
import { requireSupabase, supabase } from '@/lib/supabase'

type Credentials = {
  email: string
  password: string
}

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signUpWithPassword: (credentials: Credentials) => Promise<{ needsEmailConfirmation: boolean }>
  signInWithPassword: (credentials: Credentials) => Promise<void>
  signInWithGoogle: (nextPath?: string) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return
      setSession(nextSession)
      setIsLoading(false)
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return
      if (error && import.meta.env.DEV) console.error('Unable to restore the Supabase session:', error.message)
      setSession(data.session)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    isLoading,
    async signUpWithPassword({ email, password }) {
      const { data, error } = await requireSupabase().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      return { needsEmailConfirmation: data.session === null }
    },
    async signInWithPassword({ email, password }) {
      const { error } = await requireSupabase().auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signInWithGoogle(nextPath = '/') {
      rememberOAuthDestination(nextPath)
      const { error } = await requireSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        clearOAuthDestination()
        throw error
      }
    },
    async signOut() {
      const { error } = await requireSupabase().auth.signOut()
      if (error) throw error
    },
    async requestPasswordReset(email) {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
    },
    async updatePassword(password) {
      const { error } = await requireSupabase().auth.updateUser({ password })
      if (error) throw error
    },
  }), [isLoading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
