import { lazy, Suspense, type ComponentType } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster } from 'sileo'
import { AuthProvider } from '@/auth/AuthContext'
import { CompleteProfileRoute, ProfileThemeSync } from '@/auth/profile-routes'
import { ProtectedRoute, PublicOnlyRoute } from '@/auth/route-guards'
import { UserCacheIsolation } from '@/auth/user-cache-isolation'
import { Layout } from '@/components/Layout'
import { LoadingScreen } from '@/components/common/loading-screen'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supabaseConfigurationError } from '@/lib/supabase'

const Dashboard = lazy(() => import('@/pages/Dashboard').then(module => ({ default: module.Dashboard })))
const AuthCallback = lazy(() => import('@/pages/AuthCallback').then(module => ({ default: module.AuthCallback })))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })))
const GymLeaguePage = lazy(() => import('@/pages/GymLeague').then(module => ({ default: module.GymLeaguePage })))
const LogPage = lazy(() => import('@/pages/LogPage').then(module => ({ default: module.LogPage })))
const Login = lazy(() => import('@/pages/Login').then(module => ({ default: module.Login })))
const Onboarding = lazy(() => import('@/pages/Onboarding').then(module => ({ default: module.Onboarding })))
const Progress = lazy(() => import('@/pages/Progress').then(module => ({ default: module.Progress })))
const History = lazy(() => import('@/pages/History').then(module => ({ default: module.History })))
const Register = lazy(() => import('@/pages/Register').then(module => ({ default: module.Register })))
const SettingsPage = lazy(() => import('@/pages/Settings').then(module => ({ default: module.SettingsPage })))
const UpdatePassword = lazy(() => import('@/pages/UpdatePassword').then(module => ({ default: module.UpdatePassword })))

function LazyRoute({ component: Component, label }: { component: ComponentType; label: string }) {
  return <Suspense fallback={<LoadingScreen label={label} />}><Component /></Suspense>
}

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

  return <BrowserRouter><AuthProvider><UserCacheIsolation /><Routes>
    <Route path="login" element={<PublicOnlyRoute><LazyRoute component={Login} label="Loading sign in" /></PublicOnlyRoute>} />
    <Route path="register" element={<PublicOnlyRoute><LazyRoute component={Register} label="Loading registration" /></PublicOnlyRoute>} />
    <Route path="forgot-password" element={<PublicOnlyRoute><LazyRoute component={ForgotPassword} label="Loading password recovery" /></PublicOnlyRoute>} />
    <Route path="auth/callback" element={<LazyRoute component={AuthCallback} label="Completing sign in" />} />
    <Route path="update-password" element={<LazyRoute component={UpdatePassword} label="Loading password update" />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<ProfileThemeSync><Outlet /></ProfileThemeSync>}>
        <Route path="onboarding" element={<LazyRoute component={Onboarding} label="Loading profile setup" />} />
        <Route element={<CompleteProfileRoute />}>
          <Route element={<Layout />}>
            <Route index element={<LazyRoute component={Dashboard} label="Loading dashboard" />} />
            <Route path="log" element={<LazyRoute component={LogPage} label="Loading daily log" />} />
            <Route path="gym-league" element={<LazyRoute component={GymLeaguePage} label="Loading Gym League" />} />
            <Route path="progress" element={<LazyRoute component={Progress} label="Loading progress" />} />
            <Route path="history" element={<LazyRoute component={History} label="Loading history" />} />
            <Route path="settings" element={<LazyRoute component={SettingsPage} label="Loading settings" />} />
          </Route>
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider><AppToaster /></BrowserRouter>
}
