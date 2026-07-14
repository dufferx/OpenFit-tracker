import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoadingScreen } from '@/components/common/loading-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'new-password-error' : undefined} {...register('password')} />{errors.password && <p id="new-password-error" role="alert" className="text-sm text-destructive">{errors.password.message}</p>}</div>
      <div className="grid gap-2"><Label htmlFor="confirm-new-password">Confirm new password</Label><Input id="confirm-new-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-new-password-error' : undefined} {...register('confirmPassword')} />{errors.confirmPassword && <p id="confirm-new-password-error" role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</p>}</div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Updating…' : 'Update password'}</Button>
    </form>
  </AuthShell>
}
