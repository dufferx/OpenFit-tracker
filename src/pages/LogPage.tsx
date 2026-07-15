import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Save } from 'lucide-react'
import { Controller, useForm, useWatch, type FieldError as HookFormFieldError, type UseFormRegisterReturn } from 'react-hook-form'
import { sileo } from 'sileo'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { PageHeader } from '@/components/common/page-header'
import { QueryErrorAlert } from '@/components/common/query-error-alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useDailyLogByDate, useUpsertDailyLog } from '@/hooks/use-daily-logs'
import { useProfile } from '@/hooks/use-profile'
import { formatCalendarDate, isCalendarDate, isFutureCalendarDate, parseCalendarDate, todayInTimeZone } from '@/lib/calendar-date'
import { getErrorMessage } from '@/lib/errors'
import { isProfileComplete } from '@/lib/profiles'
import type { DailyLog, DailyLogInput } from '@/types/models'

const requiredNumber = (label: string, maximum: number) => z.string()
  .refine(value => value.trim() !== '', `${label} is required.`)
  .refine(value => Number.isFinite(Number(value)), `${label} is required.`)
  .refine(value => Number(value) >= 0 && Number(value) <= maximum, `${label} must be between 0 and ${maximum}.`)

const optionalNumber = (label: string, minimum: number, maximum: number) => z.string()
  .refine(value => value.trim() === '' || Number.isFinite(Number(value)), `${label} must be between ${minimum} and ${maximum}.`)
  .refine(value => value.trim() === '' || (Number(value) >= minimum && Number(value) <= maximum), `${label} must be between ${minimum} and ${maximum}.`)

function dailyLogSchema(timeZone: string) {
  return z.object({
    logDate: z.string().refine(isCalendarDate, 'Select a valid date.').refine(value => !isFutureCalendarDate(value, timeZone), `Daily logs cannot be created after today in ${timeZone}.`),
    caloriesConsumed: requiredNumber('Calories consumed', 15000),
    proteinGrams: requiredNumber('Protein', 1000),
    totalCaloriesBurned: requiredNumber('Calories burned', 15000),
    weightKg: optionalNumber('Weight', 20, 400),
    bodyFatPercentage: optionalNumber('Body fat', 1, 70),
    notes: z.string(),
  }).transform(values => ({
    logDate: values.logDate,
    caloriesConsumed: Number(values.caloriesConsumed),
    proteinGrams: Number(values.proteinGrams),
    totalCaloriesBurned: Number(values.totalCaloriesBurned),
    weightKg: values.weightKg.trim() === '' ? null : Number(values.weightKg),
    bodyFatPercentage: values.bodyFatPercentage.trim() === '' ? null : Number(values.bodyFatPercentage),
    notes: values.notes.trim() || null,
  } satisfies DailyLogInput))
}

type DailyLogFormValues = z.input<ReturnType<typeof dailyLogSchema>>
type ValidatedDailyLogFormValues = z.output<ReturnType<typeof dailyLogSchema>>

function formDefaults(logDate: string, existing?: DailyLog | null): DailyLogFormValues {
  return {
    logDate,
    caloriesConsumed: existing?.caloriesConsumed.toString() ?? '',
    proteinGrams: existing?.proteinGrams.toString() ?? '',
    totalCaloriesBurned: existing?.totalCaloriesBurned.toString() ?? '',
    weightKg: existing?.weightKg?.toString() ?? '',
    bodyFatPercentage: existing?.bodyFatPercentage?.toString() ?? '',
    notes: existing?.notes ?? '',
  }
}

export function LogPage() {
  const profileQuery = useProfile()

  if (profileQuery.isPending) return <><PageHeader eyebrow="Quick entry" title="Log your day" description="Loading your calendar settings…" /><div role="status" aria-label="Loading profile timezone"><Skeleton className="mx-auto h-96 max-w-3xl" /></div></>
  if (profileQuery.isError) return <LogPageError message={profileQuery.error.message} retry={() => void profileQuery.refetch()} />
  if (!isProfileComplete(profileQuery.data)) return <LogPageError message="A valid profile timezone and fitness targets are required before logging a day." retry={() => void profileQuery.refetch()} />

  return <TimeZoneAwareLogForm timeZone={profileQuery.data.timezone} />
}

function TimeZoneAwareLogForm({ timeZone }: { timeZone: string }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const today = todayInTimeZone(timeZone)
  const requestedDate = params.get('date')
  const initialDate = requestedDate && isCalendarDate(requestedDate) && !isFutureCalendarDate(requestedDate, timeZone) ? requestedDate : today
  const schema = dailyLogSchema(timeZone)
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DailyLogFormValues, unknown, ValidatedDailyLogFormValues>({
    resolver: zodResolver(schema),
    defaultValues: formDefaults(initialDate),
  })
  const date = useWatch({ control, name: 'logDate' })
  const existingQuery = useDailyLogByDate(date)
  const saveLog = useUpsertDailyLog()
  const existing = existingQuery.data
  const saveInFlight = useRef(false)

  useEffect(() => reset(formDefaults(date, existing)), [date, existing, reset])

  const submit = handleSubmit(async input => {
    if (saveInFlight.current) return
    saveInFlight.current = true
    try {
      await saveLog.mutateAsync(input)
      sileo.success({ title: existing ? 'Daily log updated' : 'Daily log saved', description: 'Your progress has been synced.' })
      navigate('/', { replace: true })
    } catch (error) {
      sileo.error({ title: 'Unable to save daily log', description: getErrorMessage(error) })
    } finally {
      saveInFlight.current = false
    }
  })

  const isBusy = existingQuery.isPending || saveLog.isPending || isSubmitting
  return <>
    <PageHeader eyebrow="Quick entry" title={existing ? 'Edit daily log' : 'Log your day'} description="Keep it simple. Enter the totals you already know." />
    <Card className="mx-auto max-w-3xl"><CardContent>
      <form onSubmit={submit} noValidate>
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Controller name="logDate" control={control} render={({ field }) => <CalendarDateField value={field.value} onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref} maximum={today} disabled={saveLog.isPending} error={errors.logDate} />} />
          {existingQuery.isPending ? <div className="grid gap-4 sm:col-span-2" role="status" aria-label="Loading daily log"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : existingQuery.isError ? <QueryErrorAlert className="sm:col-span-2" title="Unable to load this daily log" message={existingQuery.error.message} retry={() => void existingQuery.refetch()} /> : <>
            <NumericField id="calories-consumed" label="Calories consumed" unit="kcal" min="0" max="15000" step="1" required disabled={saveLog.isPending} error={errors.caloriesConsumed} registration={register('caloriesConsumed')} />
            <NumericField id="protein-grams" label="Protein consumed" unit="g" min="0" max="1000" step="0.1" required disabled={saveLog.isPending} error={errors.proteinGrams} registration={register('proteinGrams')} />
            <NumericField id="calories-burned" label="Total calories burned" unit="kcal" min="0" max="15000" step="1" required disabled={saveLog.isPending} error={errors.totalCaloriesBurned} registration={register('totalCaloriesBurned')} />
            <NumericField id="weight-kg" label="Weight (optional)" unit="kg" min="20" max="400" step="0.1" disabled={saveLog.isPending} error={errors.weightKg} registration={register('weightKg')} />
            <NumericField id="body-fat-percentage" label="Body fat (optional)" unit="%" min="1" max="70" step="0.1" disabled={saveLog.isPending} error={errors.bodyFatPercentage} registration={register('bodyFatPercentage')} />
            <Field className="sm:col-span-2"><FieldLabel htmlFor="notes">Notes (optional)</FieldLabel><Textarea id="notes" placeholder="Anything worth remembering about today?" disabled={saveLog.isPending} {...register('notes')} /></Field>
            <div className="sm:col-span-2"><Button type="submit" size="lg" className="w-full" disabled={isBusy}>{saveLog.isPending || isSubmitting ? <Spinner aria-hidden="true" /> : <Save aria-hidden="true" />}{saveLog.isPending || isSubmitting ? 'Saving…' : existing ? 'Update daily log' : 'Save daily log'}</Button></div>
          </>}
        </FieldGroup>
      </form>
    </CardContent></Card>
  </>
}

function CalendarDateField({ value, onChange, onBlur, inputRef, maximum, disabled, error }: {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  inputRef: (element: HTMLButtonElement | null) => void
  maximum: string
  disabled: boolean
  error?: HookFormFieldError
}) {
  const [open, setOpen] = useState(false)
  const selected = calendarDateToDate(value)
  const maximumDate = calendarDateToDate(maximum)
  return <Field className="sm:col-span-2" data-invalid={Boolean(error)}><FieldLabel htmlFor="log-date">Date</FieldLabel><Popover open={open} onOpenChange={nextOpen => { setOpen(nextOpen); if (!nextOpen) onBlur() }}><PopoverTrigger render={<Button id="log-date" ref={inputRef} type="button" variant="outline" className="w-full justify-start text-left font-normal" disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? 'log-date-error' : undefined} />}><CalendarIcon aria-hidden="true" />{formatCalendarDate(value)}</PopoverTrigger><PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0"><Calendar mode="single" required selected={selected} defaultMonth={selected} disabled={{ after: maximumDate }} onSelect={nextDate => { onChange(dateToCalendarDate(nextDate)); setOpen(false) }} autoFocus /></PopoverContent></Popover><FieldError id="log-date-error" errors={[error]} /></Field>
}

function NumericField({ id, label, unit, error, registration, ...inputProps }: {
  id: string
  label: string
  unit: string
  error?: HookFormFieldError
  registration: UseFormRegisterReturn
  min: string
  max: string
  step: string
  required?: boolean
  disabled: boolean
}) {
  const errorId = `${id}-error`
  return <Field data-invalid={Boolean(error)}><FieldLabel htmlFor={id}>{label}</FieldLabel><InputGroup data-disabled={inputProps.disabled}><InputGroupInput id={id} type="number" inputMode="decimal" placeholder="0" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...inputProps} {...registration} /><InputGroupAddon align="inline-end" aria-hidden="true"><InputGroupText>{unit}</InputGroupText></InputGroupAddon></InputGroup><FieldError id={errorId} errors={[error]} /></Field>
}

function calendarDateToDate(value: string) {
  const parts = parseCalendarDate(value)
  if (!parts) return undefined
  return new Date(parts.year, parts.month - 1, parts.day, 12)
}

function dateToCalendarDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function LogPageError({ message, retry }: { message: string; retry: () => void }) {
  return <><PageHeader eyebrow="Quick entry" title="Log your day" /><QueryErrorAlert title="Unable to load daily log" message={message} retry={retry} /></>
}
