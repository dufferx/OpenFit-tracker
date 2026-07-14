import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { sileo } from 'sileo'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getErrorMessage } from '@/lib/errors'

const resetSchema = z.object({ email: z.email('Enter a valid email address.') })
type ResetValues = z.infer<typeof resetSchema>

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  })

  const submit = handleSubmit(async ({ email }) => {
    try {
      await requestPasswordReset(email)
      reset()
      sileo.success({ title: 'Check your email', description: 'If an account exists for that address, a password reset link is on its way.' })
    } catch (error) {
      sileo.error({ title: 'Unable to send reset email', description: getErrorMessage(error) })
    }
  })

  return <AuthShell title="Reset your password" description="Enter your email and we’ll send you a secure reset link.">
    <form onSubmit={submit} noValidate>
      <FieldGroup className="gap-4">
      <Field data-invalid={Boolean(errors.email)}><FieldLabel htmlFor="reset-email">Email</FieldLabel><Input id="reset-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'reset-email-error' : undefined} {...register('email')} /><FieldError id="reset-email-error" errors={[errors.email]} /></Field>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting && <Spinner aria-hidden="true" />}{isSubmitting ? 'Sending…' : 'Send reset link'}</Button>
      <Link to="/login" className="text-center text-sm font-medium text-primary hover:underline">Back to sign in</Link>
      </FieldGroup>
    </form>
  </AuthShell>
}
