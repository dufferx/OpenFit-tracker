import { useMemo, useState } from 'react'
import { Download, FileArchive, FileChartColumnIncreasing, FileSpreadsheet, ShieldAlert } from 'lucide-react'
import { sileo } from 'sileo'
import { QueryErrorAlert } from '@/components/common/query-error-alert'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useExportDailyLogs } from '@/hooks/use-daily-logs'
import { formatCalendarDate, todayInTimeZone } from '@/lib/calendar-date'
import {
  createDailyLogsCsv,
  createJsonBackup,
  downloadBlob,
  EXPORT_RANGE_OPTIONS,
  exportFilename,
  resolveExportRange,
  serializeJsonBackup,
  validateCustomExportRange,
  type ExportFormat,
  type ExportRange,
  type ExportRangeId,
} from '@/lib/export-data'
import { getErrorMessage } from '@/lib/errors'
import type { ProgressRange } from '@/lib/progress-data'
import type { Profile } from '@/types/models'

const FORMAT_OPTIONS: Array<{ value: ExportFormat; label: string; description: string }> = [
  { value: 'csv', label: 'CSV spreadsheet', description: 'Daily records for analysis in spreadsheet and data tools.' },
  { value: 'json', label: 'JSON backup', description: 'Versioned profile, summary, and records for personal backup.' },
  { value: 'pdf', label: 'PDF report', description: 'A readable progress report with targets, charts, and recent records.' },
]

function safeRange(id: ExportRangeId, timeZone: string, from: string, to: string): ExportRange | null {
  try {
    return resolveExportRange(id, timeZone, { from, to })
  } catch {
    return null
  }
}

export function ExportDrawer({ profile, progressRange }: {
  profile: Profile & { timezone: string }
  progressRange: ProgressRange
}) {
  const [open, setOpen] = useState(false)
  const [rangeId, setRangeId] = useState<ExportRangeId>(progressRange)
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const today = todayInTimeZone(profile.timezone)
  const customError = rangeId === 'custom' ? validateCustomExportRange(customFrom, customTo, today) : null
  const range = useMemo(
    () => safeRange(rangeId, profile.timezone, customFrom, customTo),
    [customFrom, customTo, profile, rangeId],
  )
  const logsQuery = useExportDailyLogs(range?.from ?? null, range?.to ?? '', Boolean(open && range))
  const logs = logsQuery.data ?? []
  const weightCount = logs.filter(log => log.weightKg !== null).length
  const bodyFatCount = logs.filter(log => log.bodyFatPercentage !== null).length
  const isBusy = logsQuery.isFetching || isGenerating

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isGenerating) return
    if (nextOpen && !open) setRangeId(progressRange)
    setOpen(nextOpen)
  }

  const generate = async () => {
    if (!profile || !range || logs.length === 0 || isGenerating) return
    setIsGenerating(true)
    try {
      const filename = exportFilename(format, range.to)
      if (format === 'csv') {
        downloadBlob(new Blob([createDailyLogsCsv(logs)], { type: 'text/csv;charset=utf-8' }), filename)
      } else if (format === 'json') {
        const backup = createJsonBackup(profile, logs, range)
        downloadBlob(new Blob([serializeJsonBackup(backup)], { type: 'application/json;charset=utf-8' }), filename)
      } else {
        const { createProgressReportPdf } = await import('@/lib/pdf-report')
        downloadBlob(createProgressReportPdf(profile, logs, range), filename)
      }
      sileo.success({ title: 'Export ready', description: `${filename} was generated on this device.` })
    } catch (error) {
      sileo.error({ title: 'Unable to generate export', description: getErrorMessage(error) })
    } finally {
      setIsGenerating(false)
    }
  }

  return <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle disablePointerDismissal={isGenerating}>
    <DrawerTrigger render={<Button variant="outline" />}><Download aria-hidden="true" />Export</DrawerTrigger>
    <DrawerContent className="[--drawer-content-height:min(48rem,calc(100dvh-1rem))] [--drawer-content-max-height:calc(100dvh-1rem)]">
      <DrawerHeader className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <DrawerTitle>Export data and reports</DrawerTitle>
        <DrawerDescription>The active Progress range is selected when this drawer opens. Export choices do not change the charts behind it.</DrawerDescription>
      </DrawerHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <Alert className="mb-5">
            <ShieldAlert aria-hidden="true" />
            <AlertTitle>Protect your download</AlertTitle>
            <AlertDescription>Downloaded files may contain private fitness information. Store and share them carefully. Files are generated only in this browser and are not uploaded.</AlertDescription>
          </Alert>
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.8fr)]">
      <Card>
        <CardHeader><CardTitle>Export options</CardTitle><CardDescription>Calendar boundaries use {profile.timezone} and include both the start and end date.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="export-range">Date range</FieldLabel>
            <Select value={rangeId} onValueChange={value => setRangeId(value as ExportRangeId)} disabled={isBusy} modal={false}>
              <SelectTrigger id="export-range" className="w-full"><SelectValue>{EXPORT_RANGE_OPTIONS.find(option => option.value === rangeId)?.label}</SelectValue></SelectTrigger>
              <SelectContent alignItemWithTrigger={false} side="bottom" align="start">{EXPORT_RANGE_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <FieldDescription>Future dates are never included. All time is fetched in safe 500-record pages.</FieldDescription>
          </Field>
          {rangeId === 'custom' && <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(customError)}><FieldLabel htmlFor="export-from">From</FieldLabel><Input id="export-from" type="date" value={customFrom} max={today} onChange={event => setCustomFrom(event.target.value)} disabled={isBusy} aria-invalid={Boolean(customError)} aria-describedby={customError ? 'custom-range-error' : undefined} /></Field>
            <Field data-invalid={Boolean(customError)}><FieldLabel htmlFor="export-to">To</FieldLabel><Input id="export-to" type="date" value={customTo} max={today} onChange={event => setCustomTo(event.target.value)} disabled={isBusy} aria-invalid={Boolean(customError)} aria-describedby={customError ? 'custom-range-error' : undefined} /></Field>
            {customError && <FieldError id="custom-range-error" className="sm:col-span-2">{customError}</FieldError>}
          </div>}
          <Field>
            <FieldLabel htmlFor="export-format">Format</FieldLabel>
            <Select value={format} onValueChange={value => setFormat(value as ExportFormat)} disabled={isBusy} modal={false}>
              <SelectTrigger id="export-format" className="w-full"><SelectValue>{FORMAT_OPTIONS.find(option => option.value === format)?.label}</SelectValue></SelectTrigger>
              <SelectContent alignItemWithTrigger={false} side="bottom" align="start">{FORMAT_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <FieldDescription>{FORMAT_OPTIONS.find(option => option.value === format)?.description}</FieldDescription>
          </Field>
          <p className="text-xs leading-5 text-muted-foreground">If no file appears, allow downloads for this site and try again. Your selected options will remain unchanged.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Preview</CardTitle><CardDescription>What will be included in this download.</CardDescription></CardHeader>
        <CardContent>
          {!range ? <Empty className="py-8"><EmptyHeader><EmptyMedia variant="icon"><FileArchive aria-hidden="true" /></EmptyMedia><EmptyTitle>Complete the date range</EmptyTitle><EmptyDescription>Choose valid start and end dates to load a preview.</EmptyDescription></EmptyHeader></Empty> : logsQuery.isPending ? <div className="space-y-3" role="status" aria-label="Loading export preview"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : logsQuery.isError ? <QueryErrorAlert title="Unable to load export data" message={logsQuery.error.message} retry={() => void logsQuery.refetch()} /> : logs.length === 0 ? <Empty className="py-8"><EmptyHeader><EmptyMedia variant="icon"><FileChartColumnIncreasing aria-hidden="true" /></EmptyMedia><EmptyTitle>No records in this range</EmptyTitle><EmptyDescription>Choose another range. Exports require at least one daily record.</EmptyDescription></EmptyHeader></Empty> : <div className="space-y-4">
            <PreviewRow label="Selected period" value={range.from ? `${formatCalendarDate(range.from)} – ${formatCalendarDate(range.to)}` : `All records through ${formatCalendarDate(range.to)}`} />
            <PreviewRow label="Daily records" value={String(logs.length)} icon={<FileSpreadsheet aria-hidden="true" />} />
            <PreviewRow label="Weight measurements" value={String(weightCount)} />
            <PreviewRow label="Body-fat measurements" value={String(bodyFatCount)} />
            <p className="pt-2 text-xs leading-5 text-muted-foreground">CSV includes daily records. JSON also includes profile targets and calculated summary. PDF includes profile targets, summary, available charts, and a compact records section.</p>
          </div>}
        </CardContent>
      </Card>
          </div>
        </div>
      </div>
      <DrawerFooter className="mx-auto w-full max-w-5xl border-t bg-popover px-4 pt-4 sm:flex-row sm:justify-end sm:px-6">
        <DrawerClose render={<Button variant="outline" disabled={isGenerating} />}>Cancel</DrawerClose>
        <Button onClick={() => void generate()} disabled={isBusy || !range || logs.length === 0}>
          {isGenerating ? <Spinner aria-hidden="true" /> : <Download aria-hidden="true" />}
          {isGenerating ? 'Generating…' : `Download ${format.toUpperCase()}`}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
}

function PreviewRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"><div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div><strong className="max-w-[60%] text-right text-sm tabular-nums">{value}</strong></div>
}
