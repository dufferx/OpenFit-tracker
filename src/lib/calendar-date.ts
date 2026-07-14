const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const RAW_OFFSET_PATTERN = /^[+-]\d{2}(?::?\d{2})?$/

export const SAFE_TIME_ZONE_FALLBACK = 'UTC'

type CalendarDateParts = {
  year: number
  month: number
  day: number
}

export type InclusiveDateRange = {
  from: string
  to: string
}

function formatCalendarDateParts({ year, month, day }: CalendarDateParts) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isValidTimeZone(value: string | null | undefined): value is string {
  if (
    !value
    || value !== value.trim()
    || RAW_OFFSET_PATTERN.test(value)
    || (value !== SAFE_TIME_ZONE_FALLBACK && !value.includes('/'))
  ) return false

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export function getBrowserTimeZone() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return isValidTimeZone(timeZone) ? timeZone : SAFE_TIME_ZONE_FALLBACK
  } catch {
    return SAFE_TIME_ZONE_FALLBACK
  }
}

export function getSupportedTimeZones(currentTimeZone?: string | null) {
  const timeZones = new Set<string>([SAFE_TIME_ZONE_FALLBACK, getBrowserTimeZone()])

  if (isValidTimeZone(currentTimeZone)) timeZones.add(currentTimeZone)

  try {
    Intl.supportedValuesOf('timeZone').forEach(timeZone => timeZones.add(timeZone))
  } catch {
    // Older browsers still receive UTC, their detected timezone, and the stored profile timezone.
  }

  return [...timeZones].sort((left, right) => {
    if (left === SAFE_TIME_ZONE_FALLBACK) return -1
    if (right === SAFE_TIME_ZONE_FALLBACK) return 1
    return left.localeCompare(right)
  })
}

export function todayInTimeZone(timeZone: string, instant = new Date()) {
  if (!isValidTimeZone(timeZone)) throw new Error(`Invalid IANA timezone: ${timeZone || '(missing)'}`)
  if (Number.isNaN(instant.getTime())) throw new Error('A valid instant is required to calculate today.')

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant)
  const values = new Map(parts.map(part => [part.type, part.value]))
  const year = Number(values.get('year'))
  const month = Number(values.get('month'))
  const day = Number(values.get('day'))

  return formatCalendarDateParts({ year, month, day })
}

export function parseCalendarDate(value: string): CalendarDateParts | null {
  if (!CALENDAR_DATE_PATTERN.test(value)) return null

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null

  return { year, month, day }
}

export function isCalendarDate(value: string) {
  return parseCalendarDate(value) !== null
}

export function isFutureCalendarDate(value: string, timeZone: string, instant = new Date()) {
  return isCalendarDate(value) && value > todayInTimeZone(timeZone, instant)
}

export function addCalendarDays(value: string, days: number) {
  const parts = parseCalendarDate(value)
  if (!parts) throw new Error(`Invalid calendar date: ${value}`)
  if (!Number.isInteger(days)) throw new Error('Calendar days must be a whole number.')

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return formatCalendarDateParts({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  })
}

export function subtractCalendarDays(value: string, days: number) {
  return addCalendarDays(value, -days)
}

export function inclusiveDateRange(timeZone: string, days: number, instant = new Date()): InclusiveDateRange {
  if (!Number.isInteger(days) || days < 1) throw new Error('An inclusive date range requires at least one whole day.')

  const to = todayInTimeZone(timeZone, instant)
  return { from: subtractCalendarDays(to, days - 1), to }
}

function calendarDateAsUtcDate(value: string) {
  const parts = parseCalendarDate(value)
  if (!parts) return null
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12))
}

export function formatCalendarDate(value: string) {
  const date = calendarDateAsUtcDate(value)
  if (!date) return value
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}

export function formatShortCalendarDate(value: string) {
  const date = calendarDateAsUtcDate(value)
  if (!date) return value
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}
