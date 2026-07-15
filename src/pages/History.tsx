import { useRef, useState } from 'react'
import { CalendarPlus, Edit3, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sileo } from 'sileo'
import { PageHeader } from '@/components/common/page-header'
import { QueryErrorAlert } from '@/components/common/query-error-alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useDailyLogs, useDeleteDailyLog } from '@/hooks/use-daily-logs'
import { formatCalendarDate } from '@/lib/calendar-date'
import { energyBalance } from '@/lib/daily-log-calculations'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

export function History() {
  const logsQuery = useDailyLogs()
  const deleteLog = useDeleteDailyLog()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const deleteInFlight = useRef(false)

  const remove = async (id: string) => {
    if (deleteInFlight.current) return
    deleteInFlight.current = true
    try {
      await deleteLog.mutateAsync(id)
      setDeleteTargetId(null)
      sileo.success({ title: 'Log deleted' })
    } catch (error) {
      sileo.error({ title: 'Unable to delete log', description: getErrorMessage(error) })
    } finally {
      deleteInFlight.current = false
    }
  }

  if (logsQuery.isPending) return <><PageHeader eyebrow="Daily records" title="History" description="Loading your records…" /><div className="space-y-3" role="status" aria-label="Loading daily logs"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></>
  if (logsQuery.isError) return <><PageHeader eyebrow="Daily records" title="History" /><QueryErrorAlert title="Unable to load history" message={logsQuery.error.message} retry={() => void logsQuery.refetch()} /></>

  const logs = logsQuery.data
  return <>
    <PageHeader eyebrow="Daily records" title="History" description={`${logs.length} total ${logs.length === 1 ? 'entry' : 'entries'}`} />
    {logs.length === 0 ? <Empty className="bg-card py-10 shadow-sm"><EmptyHeader><EmptyMedia variant="icon"><CalendarPlus aria-hidden="true" /></EmptyMedia><EmptyTitle>No daily logs yet</EmptyTitle><EmptyDescription>Your saved records will appear here after you add your first day.</EmptyDescription></EmptyHeader><EmptyContent><Link to="/log" className={buttonVariants()}><Plus aria-hidden="true" />Add daily log</Link></EmptyContent></Empty> : <div className="space-y-3">{logs.map(log => {
      const formattedDate = formatCalendarDate(log.logDate)
      const isDeleting = deleteLog.isPending && deleteTargetId === log.id
      return <Card key={log.id} className="py-4"><CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="min-w-36"><p className="font-semibold">{formattedDate}</p><p className="text-xs text-muted-foreground">Balance {energyBalance(log) > 0 ? '+' : ''}{energyBalance(log)} kcal</p></div><div className="grid flex-1 grid-cols-2 gap-4 text-sm md:grid-cols-4"><div><span className="text-muted-foreground">Consumed</span><strong className="block">{log.caloriesConsumed} kcal</strong></div><div><span className="text-muted-foreground">Protein</span><strong className="block">{log.proteinGrams} g</strong></div><div><span className="text-muted-foreground">Burned</span><strong className="block">{log.totalCaloriesBurned} kcal</strong></div><div><span className="text-muted-foreground">Weight</span><strong className="block">{log.weightKg ?? '—'} kg</strong></div></div><div className="flex gap-2"><Link className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1 sm:flex-none')} to={`/log?date=${log.logDate}`}><Edit3 />Edit</Link><AlertDialog open={deleteTargetId === log.id} onOpenChange={open => {
        if (open) setDeleteTargetId(log.id)
        else if (!deleteLog.isPending) setDeleteTargetId(null)
      }}><AlertDialogTrigger render={<Button variant="destructive" size="icon" disabled={deleteLog.isPending} aria-label={`Delete log for ${formattedDate}`} />}><Trash2 /></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete daily log?</AlertDialogTitle><AlertDialogDescription>The daily log for {formattedDate} will be permanently deleted. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleteLog.isPending}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={deleteLog.isPending} onClick={() => void remove(log.id)}>{isDeleting && <Spinner aria-hidden="true" />}Delete log</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></CardContent></Card>
    })}</div>}
  </>
}
