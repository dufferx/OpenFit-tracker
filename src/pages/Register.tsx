import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import { AuthShell } from '@/components/auth/auth-shell'
import { GoogleIcon } from '@/components/auth/google-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/lib/errors'

const registerSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

type RegisterValues = z.infer<typeof registerSchema>

export function Register() {
  const { signUpWithPassword, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const submit = handleSubmit(async ({ email, password }) => {
    try {
      const { needsEmailConfirmation } = await signUpWithPassword({ email, password })
      if (needsEmailConfirmation) {
        sileo.success({ title: 'Check your email', description: 'Confirm your email address to finish creating your account.' })
        navigate('/login', { replace: true })
      } else {
        sileo.success({ title: 'Account created', description: 'Your OpenFit account is ready.' })
        navigate('/', { replace: true })
      }
    } catch (error) {
      sileo.error({ title: 'Unable to create account', description: getErrorMessage(error) })
    }
  })

  const googleSignIn = async () => {
    setIsGoogleSubmitting(true)
    try {
      await signInWithGoogle('/')
    } catch (error) {
      sileo.error({ title: 'Unable to continue with Google', description: getErrorMessage(error) })
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  const isPending = isSubmitting || isGoogleSubmitting

  return <AuthShell title="Create your account" description="Your fitness data is private and belongs only to you.">
    <div className="grid gap-5">
      <Button type="button" variant="outline" className="w-full" onClick={googleSignIn} disabled={isPending}><GoogleIcon />{isGoogleSubmitting ? 'Redirecting…' : 'Continue with Google'}</Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>or use email</span><span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div className="grid gap-2"><Label htmlFor="register-email">Email</Label><Input id="register-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} {...register('email')} />{errors.email && <p id="register-email-error" role="alert" className="text-sm text-destructive">{errors.email.message}</p>}</div>
        <div className="grid gap-2"><Label htmlFor="register-password">Password</Label><Input id="register-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} {...register('password')} />{errors.password && <p id="register-password-error" role="alert" className="text-sm text-destructive">{errors.password.message}</p>}</div>
        <div className="grid gap-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} {...register('confirmPassword')} />{errors.confirmPassword && <p id="confirm-password-error" role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</p>}</div>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
    </div>
  </AuthShell>
}
