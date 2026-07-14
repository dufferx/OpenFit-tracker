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
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
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
      <Button type="button" variant="outline" className="w-full" onClick={googleSignIn} disabled={isPending}>{isGoogleSubmitting ? <Spinner aria-hidden="true" /> : <GoogleIcon />}{isGoogleSubmitting ? 'Redirecting…' : 'Continue with Google'}</Button>
      <FieldSeparator className="text-xs">or use email</FieldSeparator>
      <form onSubmit={submit} noValidate>
        <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.email)}><FieldLabel htmlFor="register-email">Email</FieldLabel><Input id="register-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} {...register('email')} /><FieldError id="register-email-error" errors={[errors.email]} /></Field>
        <Field data-invalid={Boolean(errors.password)}><FieldLabel htmlFor="register-password">Password</FieldLabel><Input id="register-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} {...register('password')} /><FieldError id="register-password-error" errors={[errors.password]} /></Field>
        <Field data-invalid={Boolean(errors.confirmPassword)}><FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel><Input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} {...register('confirmPassword')} /><FieldError id="confirm-password-error" errors={[errors.confirmPassword]} /></Field>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>{isSubmitting && <Spinner aria-hidden="true" />}{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
    </div>
  </AuthShell>
}
