import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster } from 'sileo'
import { AuthProvider } from '@/auth/AuthContext'
import { CompleteProfileRoute, ProfileThemeSync } from '@/auth/profile-routes'
import { ProtectedRoute, PublicOnlyRoute } from '@/auth/route-guards'
import { Layout } from '@/components/Layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dashboard } from '@/pages/Dashboard'
import { AuthCallback } from '@/pages/AuthCallback'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { LogPage } from '@/pages/LogPage'
import { Login } from '@/pages/Login'
import { Onboarding } from '@/pages/Onboarding'
import { Progress } from '@/pages/Progress'
import { History } from '@/pages/History'
import { Register } from '@/pages/Register'
import { SettingsPage } from '@/pages/Settings'
import { UpdatePassword } from '@/pages/UpdatePassword'
import { supabaseConfigurationError } from '@/lib/supabase'

function ConfigurationError() {
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
    <Alert variant="destructive" className="max-w-lg bg-card p-6 shadow-sm">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>Supabase configuration required</AlertTitle>
      <AlertDescription><p>{supabaseConfigurationError}</p>{import.meta.env.DEV && <p className="mt-3">Restart the Vite development server after updating .env.local.</p>}</AlertDescription>
    </Alert>
  </main>
}

function AppToaster() {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'

  return <Toaster position="top-center" theme={theme} options={{ fill: 'var(--popover)' }} />
}

export default function App() {
  if (supabaseConfigurationError) return <ConfigurationError />

  return <BrowserRouter><AuthProvider><Routes>
    <Route path="login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
    <Route path="register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
    <Route path="forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
    <Route path="auth/callback" element={<AuthCallback />} />
    <Route path="update-password" element={<UpdatePassword />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<ProfileThemeSync><Outlet /></ProfileThemeSync>}>
        <Route path="onboarding" element={<Onboarding />} />
        <Route element={<CompleteProfileRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="log" element={<LogPage />} />
            <Route path="progress" element={<Progress />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider><AppToaster /></BrowserRouter>
}
