import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoadingScreen } from '@/components/common/loading-screen'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getErrorMessage } from '@/lib/errors'

const passwordSchema = z.object({
  password: z.string().min(8, 'Use at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

type PasswordValues = z.infer<typeof passwordSchema>

export function UpdatePassword() {
  const { user, isLoading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const submit = handleSubmit(async ({ password }) => {
    try {
      await updatePassword(password)
      sileo.success({ title: 'Password updated', description: 'You can continue using OpenFit.' })
      navigate('/', { replace: true })
    } catch (error) {
      sileo.error({ title: 'Unable to update password', description: getErrorMessage(error) })
    }
  })

  if (isLoading) return <LoadingScreen label="Verifying reset link" />
  if (!user) return <AuthShell title="Reset link unavailable" description="This password reset link is invalid or has expired."><Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Request a new reset link</Link></AuthShell>

  return <AuthShell title="Choose a new password" description="Use at least 8 characters for your new password.">
    <form onSubmit={submit} noValidate>
      <FieldGroup className="gap-4">
      <Field data-invalid={Boolean(errors.password)}><FieldLabel htmlFor="new-password">New password</FieldLabel><Input id="new-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'new-password-error' : undefined} {...register('password')} /><FieldError id="new-password-error" errors={[errors.password]} /></Field>
      <Field data-invalid={Boolean(errors.confirmPassword)}><FieldLabel htmlFor="confirm-new-password">Confirm new password</FieldLabel><Input id="confirm-new-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-new-password-error' : undefined} {...register('confirmPassword')} /><FieldError id="confirm-new-password-error" errors={[errors.confirmPassword]} /></Field>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting && <Spinner aria-hidden="true" />}{isSubmitting ? 'Updating…' : 'Update password'}</Button>
      </FieldGroup>
    </form>
  </AuthShell>
}
