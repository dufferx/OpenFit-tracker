import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import type { LoginLocationState } from '@/auth/route-guards'
import { AuthShell } from '@/components/auth/auth-shell'
import { GoogleIcon } from '@/components/auth/google-icon'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { safeAuthDestination } from '@/lib/auth-redirect'
import { getErrorMessage } from '@/lib/errors'

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

type LoginValues = z.infer<typeof loginSchema>

export function Login() {
  const { signInWithPassword, signInWithGoogle } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as LoginLocationState | null
  const destination = safeAuthDestination(locationState?.from)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit(async values => {
    try {
      await signInWithPassword(values)
      sileo.success({ title: 'Welcome back' })
      navigate(destination, { replace: true })
    } catch (error) {
      sileo.error({ title: 'Unable to sign in', description: getErrorMessage(error) })
    }
  })

  const googleSignIn = async () => {
    setIsGoogleSubmitting(true)
    try {
      await signInWithGoogle(destination)
    } catch (error) {
      sileo.error({ title: 'Unable to continue with Google', description: getErrorMessage(error) })
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  const isPending = isSubmitting || isGoogleSubmitting

  return <AuthShell title="Welcome back" description="Sign in to continue to your private fitness tracker.">
    <div className="grid gap-5">
      {locationState?.authError && <Alert variant="destructive"><AlertDescription>{locationState.authError}</AlertDescription></Alert>}
      <Button type="button" variant="outline" className="w-full" onClick={googleSignIn} disabled={isPending}>{isGoogleSubmitting ? <Spinner aria-hidden="true" /> : <GoogleIcon />}{isGoogleSubmitting ? 'Redirecting…' : 'Continue with Google'}</Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>or use email</span><span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
          {errors.email && <p id="email-error" role="alert" className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link></div>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
          {errors.password && <p id="password-error" role="alert" className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>{isSubmitting && <Spinner aria-hidden="true" />}{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">New to OpenFit? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link></p>
    </div>
  </AuthShell>
}
