import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { Profile, ProfileInput } from '@/types/models'

const requiredNumber = (label: string, minimum: number, maximum: number, integer = false) => z.string()
  .min(1, `${label} is required.`)
  .refine(value => Number.isFinite(Number(value)), `${label} must be a number.`)
  .refine(value => Number(value) >= minimum && Number(value) <= maximum, `${label} must be between ${minimum} and ${maximum}.`)
  .refine(value => !integer || Number.isInteger(Number(value)), `${label} must be a whole number.`)

const optionalNumber = (label: string, minimum: number, maximum: number) => z.string()
  .refine(value => value === '' || Number.isFinite(Number(value)), `${label} must be a number.`)
  .refine(value => value === '' || (Number(value) >= minimum && Number(value) <= maximum), `${label} must be between ${minimum} and ${maximum}.`)

const profileFormSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required.').max(80, 'Display name must be 80 characters or fewer.'),
  calorieTarget: requiredNumber('Calorie target', 500, 15000, true),
  proteinTarget: requiredNumber('Protein target', 1, 1000),
  targetWeight: optionalNumber('Target weight', 20, 400),
  targetBodyFat: optionalNumber('Target body fat', 1, 70),
  theme: z.enum(['light', 'dark', 'system']),
}).transform(values => ({
  displayName: values.displayName,
  calorieTarget: Number(values.calorieTarget),
  proteinTarget: Number(values.proteinTarget),
  targetWeight: values.targetWeight === '' ? null : Number(values.targetWeight),
  targetBodyFat: values.targetBodyFat === '' ? null : Number(values.targetBodyFat),
  theme: values.theme,
}))

type ProfileFormValues = z.input<typeof profileFormSchema>
type ValidatedProfileFormValues = z.output<typeof profileFormSchema>

function formDefaults(profile: Profile | null, suggestedDisplayName = ''): ProfileFormValues {
  return {
    displayName: profile?.displayName ?? suggestedDisplayName,
    calorieTarget: profile?.calorieTarget?.toString() ?? '',
    proteinTarget: profile?.proteinTarget?.toString() ?? '',
    targetWeight: profile?.targetWeight?.toString() ?? '',
    targetBodyFat: profile?.targetBodyFat?.toString() ?? '',
    theme: profile?.theme ?? 'system',
  }
}

export function ProfileForm({ profile, suggestedDisplayName, submitLabel, pendingLabel, isPending, onSubmit }: {
  profile: Profile | null
  suggestedDisplayName?: string
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  onSubmit: (input: ProfileInput) => Promise<void>
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues, unknown, ValidatedProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: formDefaults(profile, suggestedDisplayName),
  })

  useEffect(() => reset(formDefaults(profile, suggestedDisplayName)), [profile, reset, suggestedDisplayName])

  const submit = handleSubmit(async values => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    await onSubmit({ ...values, timezone: browserTimezone })
  })
  const disabled = isPending || isSubmitting

  return <form onSubmit={submit} className="grid gap-5 xl:grid-cols-2" noValidate>
    <section className="grid content-start gap-5 rounded-xl border bg-card p-6 shadow-sm">
      <div><h2 className="font-semibold">Profile</h2><p className="mt-1 text-sm text-muted-foreground">How OpenFit addresses you and displays the interface.</p></div>
      <div className="grid gap-2"><Label htmlFor="display-name">Display name</Label><Input id="display-name" autoComplete="name" aria-invalid={Boolean(errors.displayName)} aria-describedby={errors.displayName ? 'display-name-error' : undefined} disabled={disabled} {...register('displayName')} />{errors.displayName && <p id="display-name-error" role="alert" className="text-sm text-destructive">{errors.displayName.message}</p>}</div>
      <div className="grid gap-2"><Label htmlFor="theme">Interface theme</Label><Select id="theme" disabled={disabled} {...register('theme')}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select></div>
    </section>
    <section className="grid content-start gap-5 rounded-xl border bg-card p-6 shadow-sm">
      <div><h2 className="font-semibold">Fitness targets</h2><p className="mt-1 text-sm text-muted-foreground">Set totals used by your dashboard and progress views.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="calorie-target" label="Daily calories" unit="kcal" min="500" max="15000" step="1" disabled={disabled} error={errors.calorieTarget?.message} registration={register('calorieTarget')} />
        <NumberField id="protein-target" label="Daily protein" unit="g" min="1" max="1000" step="0.1" disabled={disabled} error={errors.proteinTarget?.message} registration={register('proteinTarget')} />
        <NumberField id="target-weight" label="Target weight (optional)" unit="kg" min="20" max="400" step="0.1" disabled={disabled} error={errors.targetWeight?.message} registration={register('targetWeight')} />
        <NumberField id="target-body-fat" label="Target body fat (optional)" unit="%" min="1" max="70" step="0.1" disabled={disabled} error={errors.targetBodyFat?.message} registration={register('targetBodyFat')} />
      </div>
    </section>
    <div className="xl:col-span-2"><Button type="submit" size="lg" className="w-full sm:w-auto" disabled={disabled}>{disabled ? pendingLabel : submitLabel}</Button></div>
  </form>
}

function NumberField({ id, label, unit, error, registration, ...inputProps }: {
  id: string
  label: string
  unit: string
  error?: string
  registration: UseFormRegisterReturn
  min: string
  max: string
  step: string
  disabled: boolean
}) {
  const errorId = `${id}-error`
  return <div className="grid gap-2"><Label htmlFor={id}>{label}</Label><div className="relative"><Input id={id} type="number" inputMode="decimal" className="pr-14" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...inputProps} {...registration} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span></div>{error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}</div>
}
