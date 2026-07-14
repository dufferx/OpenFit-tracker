import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { sileo } from 'sileo'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/page-header'
import { QueryErrorAlert } from '@/components/common/query-error-alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useDailyLogByDate, useUpsertDailyLog } from '@/hooks/use-daily-logs'
import { useProfile } from '@/hooks/use-profile'
import { isCalendarDate, isFutureCalendarDate, todayInTimeZone } from '@/lib/calendar-date'
import { getErrorMessage } from '@/lib/errors'
import { isProfileComplete } from '@/lib/profiles'
import type { DailyLogInput } from '@/types/models'

type FormState = {
  caloriesConsumed: string
  proteinGrams: string
  totalCaloriesBurned: string
  weightKg: string
  bodyFatPercentage: string
  notes: string
}

const EMPTY_FORM: FormState = { caloriesConsumed: '', proteinGrams: '', totalCaloriesBurned: '', weightKg: '', bodyFatPercentage: '', notes: '' }

function parseRequiredNumber(value: string, label: string, maximum: number) {
  const parsed = Number(value)
  if (value.trim() === '' || !Number.isFinite(parsed)) throw new Error(`${label} is required.`)
  if (parsed < 0 || parsed > maximum) throw new Error(`${label} must be between 0 and ${maximum}.`)
  return parsed
}

function parseOptionalNumber(value: string, label: string, minimum: number, maximum: number) {
  if (value.trim() === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) throw new Error(`${label} must be between ${minimum} and ${maximum}.`)
  return parsed
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
  const [date, setDate] = useState(initialDate)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const existingQuery = useDailyLogByDate(date)
  const saveLog = useUpsertDailyLog()
  const existing = existingQuery.data
  const saveInFlight = useRef(false)

  useEffect(() => {
    setForm(existing ? {
      caloriesConsumed: existing.caloriesConsumed.toString(),
      proteinGrams: existing.proteinGrams.toString(),
      totalCaloriesBurned: existing.totalCaloriesBurned.toString(),
      weightKg: existing.weightKg?.toString() ?? '',
      bodyFatPercentage: existing.bodyFatPercentage?.toString() ?? '',
      notes: existing.notes ?? '',
    } : EMPTY_FORM)
  }, [date, existing])

  const set = (key: keyof FormState, value: string) => setForm(current => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (saveInFlight.current) return
    saveInFlight.current = true
    try {
      if (!isCalendarDate(date)) throw new Error('Select a valid date.')
      if (isFutureCalendarDate(date, timeZone)) throw new Error(`Daily logs cannot be created after today in ${timeZone}.`)
      const input: DailyLogInput = {
        logDate: date,
        caloriesConsumed: parseRequiredNumber(form.caloriesConsumed, 'Calories consumed', 15000),
        proteinGrams: parseRequiredNumber(form.proteinGrams, 'Protein', 1000),
        totalCaloriesBurned: parseRequiredNumber(form.totalCaloriesBurned, 'Calories burned', 15000),
        weightKg: parseOptionalNumber(form.weightKg, 'Weight', 20, 400),
        bodyFatPercentage: parseOptionalNumber(form.bodyFatPercentage, 'Body fat', 1, 70),
        notes: form.notes.trim() || null,
      }
      await saveLog.mutateAsync(input)
      sileo.success({ title: existing ? 'Daily log updated' : 'Daily log saved', description: 'Your progress has been synced.' })
      navigate('/', { replace: true })
    } catch (error) {
      sileo.error({ title: 'Unable to save daily log', description: getErrorMessage(error) })
    } finally {
      saveInFlight.current = false
    }
  }

  const isBusy = existingQuery.isPending || saveLog.isPending
  return <>
    <PageHeader eyebrow="Quick entry" title={existing ? 'Edit daily log' : 'Log your day'} description="Keep it simple. Enter the totals you already know." />
    <Card className="mx-auto max-w-3xl"><CardContent>
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2"><Label htmlFor="log-date">Date</Label><Input id="log-date" type="date" value={date} max={today} onChange={event => setDate(event.target.value)} disabled={saveLog.isPending} /></div>
        {existingQuery.isPending ? <div className="grid gap-4 sm:col-span-2" role="status" aria-label="Loading daily log"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : existingQuery.isError ? <QueryErrorAlert className="sm:col-span-2" title="Unable to load this daily log" message={existingQuery.error.message} retry={() => void existingQuery.refetch()} /> : <>
          {([
            ['caloriesConsumed', 'Calories consumed', 'kcal', '1', '0', '15000'],
            ['proteinGrams', 'Protein consumed', 'g', '0.1', '0', '1000'],
            ['totalCaloriesBurned', 'Total calories burned', 'kcal', '1', '0', '15000'],
            ['weightKg', 'Weight (optional)', 'kg', '0.1', '20', '400'],
            ['bodyFatPercentage', 'Body fat (optional)', '%', '0.1', '1', '70'],
          ] as const).map(([key, label, unit, step, minimum, maximum]) => <div key={key} className="grid gap-2"><Label htmlFor={key}>{label}</Label><div className="relative"><Input id={key} inputMode="decimal" type="number" step={step} min={minimum} max={maximum} value={form[key]} onChange={event => set(key, event.target.value)} placeholder="0" className="pr-14" disabled={saveLog.isPending} required={key === 'caloriesConsumed' || key === 'proteinGrams' || key === 'totalCaloriesBurned'} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span></div></div>)}
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="notes">Notes (optional)</Label><Textarea id="notes" value={form.notes} onChange={event => set('notes', event.target.value)} placeholder="Anything worth remembering about today?" disabled={saveLog.isPending} /></div>
          <div className="sm:col-span-2"><Button type="submit" size="lg" className="w-full" disabled={isBusy}>{saveLog.isPending ? <Spinner aria-hidden="true" /> : <Save aria-hidden="true" />}{saveLog.isPending ? 'Saving…' : existing ? 'Update daily log' : 'Save daily log'}</Button></div>
        </>}
      </form>
    </CardContent></Card>
  </>
}

function LogPageError({ message, retry }: { message: string; retry: () => void }) {
  return <><PageHeader eyebrow="Quick entry" title="Log your day" /><QueryErrorAlert title="Unable to load daily log" message={message} retry={retry} /></>
}
