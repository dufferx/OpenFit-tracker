import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sileo'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from '@/auth/route-guards'
import { Layout } from '@/components/Layout'
import { AppProvider } from '@/AppContext'
import { Dashboard } from '@/pages/Dashboard'
import { AuthCallback } from '@/pages/AuthCallback'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { LogPage } from '@/pages/LogPage'
import { Login } from '@/pages/Login'
import { Progress } from '@/pages/Progress'
import { History } from '@/pages/History'
import { Register } from '@/pages/Register'
import { SettingsPage } from '@/pages/Settings'
import { UpdatePassword } from '@/pages/UpdatePassword'
import { supabaseConfigurationError } from '@/lib/supabase'

function ConfigurationError() {
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
    <div className="max-w-lg rounded-xl border border-destructive/40 bg-card p-6 shadow-sm">
      <h1 className="text-lg font-semibold">Supabase configuration required</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{supabaseConfigurationError}</p>
      {import.meta.env.DEV && <p className="mt-4 text-sm text-muted-foreground">Restart the Vite development server after updating .env.local.</p>}
    </div>
  </main>
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
      <Route element={<AppProvider><Layout /></AppProvider>}>
        <Route index element={<Dashboard />} />
        <Route path="log" element={<LogPage />} />
        <Route path="progress" element={<Progress />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider><Toaster position="top-center" /></BrowserRouter>
}
