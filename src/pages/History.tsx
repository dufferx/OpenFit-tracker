import { Edit3, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sileo } from 'sileo'
import { PageHeader } from '@/components/common/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyLogs, useDeleteDailyLog } from '@/hooks/use-daily-logs'
import { formatCalendarDate } from '@/lib/calendar-date'
import { energyBalance } from '@/lib/daily-log-calculations'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

export function History() {
  const logsQuery = useDailyLogs()
  const deleteLog = useDeleteDailyLog()

  const remove = async (id: string) => {
    if (!window.confirm('Delete this daily log? This action cannot be undone.')) return
    try {
      await deleteLog.mutateAsync(id)
      sileo.success({ title: 'Log deleted' })
    } catch (error) {
      sileo.error({ title: 'Unable to delete log', description: getErrorMessage(error) })
    }
  }

  if (logsQuery.isPending) return <><PageHeader eyebrow="Daily records" title="History" description="Loading your records…" /><div className="space-y-3" role="status" aria-label="Loading daily logs"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></>
  if (logsQuery.isError) return <><PageHeader eyebrow="Daily records" title="History" /><Card><CardContent className="space-y-4 text-center"><p role="alert" className="text-sm text-destructive">{logsQuery.error.message}</p><Button variant="outline" onClick={() => void logsQuery.refetch()}>Try again</Button></CardContent></Card></>

  const logs = logsQuery.data
  return <>
    <PageHeader eyebrow="Daily records" title="History" description={`${logs.length} total ${logs.length === 1 ? 'entry' : 'entries'}`} />
    {logs.length === 0 ? <Card><CardContent className="py-10 text-center"><p className="font-medium">No daily logs yet</p><p className="mt-2 text-sm text-muted-foreground">Your saved records will appear here.</p></CardContent></Card> : <div className="space-y-3">{logs.map(log => <Card key={log.id} className="py-4"><CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="min-w-36"><p className="font-semibold">{formatCalendarDate(log.logDate)}</p><p className="text-xs text-muted-foreground">Balance {energyBalance(log) > 0 ? '+' : ''}{energyBalance(log)} kcal</p></div><div className="grid flex-1 grid-cols-2 gap-4 text-sm md:grid-cols-4"><div><span className="text-muted-foreground">Consumed</span><strong className="block">{log.caloriesConsumed} kcal</strong></div><div><span className="text-muted-foreground">Protein</span><strong className="block">{log.proteinGrams} g</strong></div><div><span className="text-muted-foreground">Burned</span><strong className="block">{log.totalCaloriesBurned} kcal</strong></div><div><span className="text-muted-foreground">Weight</span><strong className="block">{log.weightKg ?? '—'} kg</strong></div></div><div className="flex gap-2"><Link className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1 sm:flex-none')} to={`/log?date=${log.logDate}`}><Edit3 />Edit</Link><Button variant="destructive" size="icon" aria-label={`Delete log for ${formatCalendarDate(log.logDate)}`} onClick={() => void remove(log.id)} disabled={deleteLog.isPending}><Trash2 /></Button></div></CardContent></Card>)}</div>}
  </>
}
