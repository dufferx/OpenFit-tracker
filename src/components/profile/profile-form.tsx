import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { getBrowserTimeZone, getSupportedTimeZones, isValidTimeZone } from '@/lib/calendar-date'
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
  timezone: z.string().trim().refine(isValidTimeZone, 'Enter a valid IANA timezone, such as America/New_York.'),
  theme: z.enum(['light', 'dark', 'system']),
}).transform(values => ({
  displayName: values.displayName,
  calorieTarget: Number(values.calorieTarget),
  proteinTarget: Number(values.proteinTarget),
  targetWeight: values.targetWeight === '' ? null : Number(values.targetWeight),
  targetBodyFat: values.targetBodyFat === '' ? null : Number(values.targetBodyFat),
  timezone: values.timezone,
  theme: values.theme,
}))

type ProfileFormValues = z.input<typeof profileFormSchema>
type ValidatedProfileFormValues = z.output<typeof profileFormSchema>
type TimeZoneOption = { label: string; value: string }

function formDefaults(profile: Profile | null, suggestedDisplayName = ''): ProfileFormValues {
  return {
    displayName: profile?.displayName ?? suggestedDisplayName,
    calorieTarget: profile?.calorieTarget?.toString() ?? '',
    proteinTarget: profile?.proteinTarget?.toString() ?? '',
    targetWeight: profile?.targetWeight?.toString() ?? '',
    targetBodyFat: profile?.targetBodyFat?.toString() ?? '',
    timezone: isValidTimeZone(profile?.timezone) ? profile.timezone : getBrowserTimeZone(),
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
  const timeZoneOptions = useMemo<TimeZoneOption[]>(() => getSupportedTimeZones(profile?.timezone).map(timeZone => ({ label: timeZone.replaceAll('_', ' '), value: timeZone })), [profile?.timezone])
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues, unknown, ValidatedProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: formDefaults(profile, suggestedDisplayName),
  })

  useEffect(() => reset(formDefaults(profile, suggestedDisplayName)), [profile, reset, suggestedDisplayName])

  const submit = handleSubmit(onSubmit)
  const disabled = isPending || isSubmitting

  return <form onSubmit={submit} className="grid gap-5 xl:grid-cols-2" noValidate>
    <FieldSet className="grid content-start gap-5 rounded-xl border bg-card p-6 shadow-sm">
      <FieldLegend className="mb-0">Profile</FieldLegend><FieldDescription className="-mt-4">How OpenFit addresses you and displays the interface.</FieldDescription>
      <Field data-invalid={Boolean(errors.displayName)}><FieldLabel htmlFor="display-name">Display name</FieldLabel><Input id="display-name" autoComplete="name" aria-invalid={Boolean(errors.displayName)} aria-describedby={errors.displayName ? 'display-name-error' : undefined} disabled={disabled} {...register('displayName')} /><FieldError id="display-name-error" errors={[errors.displayName]} /></Field>
      <Field data-invalid={Boolean(errors.timezone)}><FieldLabel htmlFor="timezone">Calendar timezone</FieldLabel><Controller name="timezone" control={control} render={({ field }) => {
        const selected = timeZoneOptions.find(option => option.value === field.value) ?? null
        return <Combobox items={timeZoneOptions} value={selected} onValueChange={option => field.onChange(option?.value ?? '')} itemToStringLabel={option => option.label} itemToStringValue={option => option.value} isItemEqualToValue={(option, value) => option.value === value.value} disabled={disabled} autoHighlight>
          <ComboboxInput id="timezone" ref={field.ref} onBlur={field.onBlur} placeholder="Search timezones…" aria-invalid={Boolean(errors.timezone)} aria-describedby={errors.timezone ? 'timezone-error timezone-help' : 'timezone-help'} disabled={disabled} />
          <ComboboxContent><ComboboxEmpty>No timezone found.</ComboboxEmpty><ComboboxList>{(option: TimeZoneOption) => <ComboboxItem key={option.value} value={option}>{option.label}</ComboboxItem>}</ComboboxList></ComboboxContent>
        </Combobox>
      }} /><FieldDescription id="timezone-help">Type a city or region to search IANA timezones. Missing values use this browser, with UTC as the safe fallback.</FieldDescription><FieldError id="timezone-error" errors={[errors.timezone]} /></Field>
      <Field data-invalid={Boolean(errors.theme)}><FieldLabel htmlFor="theme">Interface theme</FieldLabel><Controller name="theme" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange} disabled={disabled}><SelectTrigger id="theme" ref={field.ref} onBlur={field.onBlur} className="w-full" aria-invalid={Boolean(errors.theme)} aria-describedby={errors.theme ? 'theme-error theme-help' : 'theme-help'}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="system">System</SelectItem><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select>} /><FieldDescription id="theme-help">Applied after your profile is successfully saved.</FieldDescription><FieldError id="theme-error" errors={[errors.theme]} /></Field>
    </FieldSet>
    <FieldSet className="grid content-start gap-5 rounded-xl border bg-card p-6 shadow-sm">
      <FieldLegend className="mb-0">Fitness targets</FieldLegend><FieldDescription className="-mt-4">Set totals used by your dashboard and progress views.</FieldDescription>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <NumberField id="calorie-target" label="Daily calories" unit="kcal" min="500" max="15000" step="1" disabled={disabled} error={errors.calorieTarget?.message} registration={register('calorieTarget')} />
        <NumberField id="protein-target" label="Daily protein" unit="g" min="1" max="1000" step="0.1" disabled={disabled} error={errors.proteinTarget?.message} registration={register('proteinTarget')} />
        <NumberField id="target-weight" label="Target weight (optional)" unit="kg" min="20" max="400" step="0.1" disabled={disabled} error={errors.targetWeight?.message} registration={register('targetWeight')} />
        <NumberField id="target-body-fat" label="Target body fat (optional)" unit="%" min="1" max="70" step="0.1" disabled={disabled} error={errors.targetBodyFat?.message} registration={register('targetBodyFat')} />
      </FieldGroup>
    </FieldSet>
    <div className="xl:col-span-2"><Button type="submit" size="lg" className="w-full sm:w-auto" disabled={disabled}>{disabled && <Spinner aria-hidden="true" />}{disabled ? pendingLabel : submitLabel}</Button></div>
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
  return <Field data-invalid={Boolean(error)}><FieldLabel htmlFor={id}>{label}</FieldLabel><InputGroup data-disabled={inputProps.disabled}><InputGroupInput id={id} type="number" inputMode="decimal" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...inputProps} {...registration} /><InputGroupAddon align="inline-end" aria-hidden="true"><InputGroupText>{unit}</InputGroupText></InputGroupAddon></InputGroup><FieldError id={errorId}>{error}</FieldError></Field>
}
