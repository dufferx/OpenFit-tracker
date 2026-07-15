import { z } from 'zod'
import { isCalendarDate, isFutureCalendarDate } from '@/lib/calendar-date'
import type { DailyLog, DailyLogInput } from '@/types/models'

const requiredNumber = (label: string, maximum: number) => z.string()
  .refine(value => value.trim() !== '', `${label} is required.`)
  .refine(value => Number.isFinite(Number(value)), `${label} is required.`)
  .refine(value => Number(value) >= 0 && Number(value) <= maximum, `${label} must be between 0 and ${maximum}.`)

const optionalNumber = (label: string, minimum: number, maximum: number) => z.string()
  .refine(value => value.trim() === '' || Number.isFinite(Number(value)), `${label} must be between ${minimum} and ${maximum}.`)
  .refine(value => value.trim() === '' || (Number(value) >= minimum && Number(value) <= maximum), `${label} must be between ${minimum} and ${maximum}.`)

export function dailyLogSchema(timeZone: string, instant?: Date) {
  return z.object({
    logDate: z.string().refine(isCalendarDate, 'Select a valid date.').refine(value => !isFutureCalendarDate(value, timeZone, instant ?? new Date()), `Daily logs cannot be created after today in ${timeZone}.`),
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

export type DailyLogFormValues = z.input<ReturnType<typeof dailyLogSchema>>
export type ValidatedDailyLogFormValues = z.output<ReturnType<typeof dailyLogSchema>>

export function dailyLogFormDefaults(logDate: string, existing?: DailyLog | null): DailyLogFormValues {
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
