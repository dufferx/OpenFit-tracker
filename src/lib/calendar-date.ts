const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function toLocalCalendarDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseCalendarDate(value: string) {
  if (!CALENDAR_DATE_PATTERN.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function isCalendarDate(value: string) {
  return parseCalendarDate(value) !== null
}

export function isFutureCalendarDate(value: string, today = toLocalCalendarDate()) {
  return isCalendarDate(value) && value > today
}

export function subtractCalendarDays(value: string, days: number) {
  const date = parseCalendarDate(value)
  if (!date) throw new Error(`Invalid calendar date: ${value}`)
  date.setDate(date.getDate() - days)
  return toLocalCalendarDate(date)
}

export function formatCalendarDate(value: string) {
  const date = parseCalendarDate(value)
  if (!date) return value
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function formatShortCalendarDate(value: string) {
  const date = parseCalendarDate(value)
  if (!date) return value
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}
