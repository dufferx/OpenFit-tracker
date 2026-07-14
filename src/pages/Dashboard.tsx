import { ArrowDownRight, Flame, Percent, Scale, Target, TrendingDown } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyLogs } from '@/hooks/use-daily-logs'
import { useProfile } from '@/hooks/use-profile'
import { formatShortCalendarDate, toLocalCalendarDate } from '@/lib/calendar-date'
import { averageLogValue, energyBalance, latestMeasurement, sortLogsChronologically } from '@/lib/daily-log-calculations'
import { isProfileComplete } from '@/lib/profiles'
import { formatNumber } from '@/lib/utils'

export function Dashboard() {
  const logsQuery = useDailyLogs()
  const profileQuery = useProfile()

  if (logsQuery.isPending || profileQuery.isPending) return <DashboardLoading displayName={profileQuery.data?.displayName} />
  if (logsQuery.isError) return <DashboardError message={logsQuery.error.message} retry={() => void logsQuery.refetch()} displayName={profileQuery.data?.displayName} />
  if (profileQuery.isError) return <DashboardError message={profileQuery.error.message} retry={() => void profileQuery.refetch()} />
  if (!isProfileComplete(profileQuery.data)) return <DashboardError message="Complete your profile before viewing target calculations." retry={() => void profileQuery.refetch()} />

  const logs = logsQuery.data
  const profile = profileQuery.data
  const todayLog = logs.find(log => log.logDate === toLocalCalendarDate())
  const recent = logs.slice(0, 7)
  const caloriesAverage = averageLogValue(recent, 'caloriesConsumed')
  const proteinAverage = averageLogValue(recent, 'proteinGrams')
  const burnedAverage = averageLogValue(recent, 'totalCaloriesBurned')
  const latestWeight = latestMeasurement(logs, 'weightKg')
  const latestBodyFat = latestMeasurement(logs, 'bodyFatPercentage')
  const weightData = sortLogsChronologically(logs.filter(log => log.weightKg !== null).slice(0, 14))

  const statCards = [
    {
      label: 'Calories consumed',
      value: formatNumber(todayLog?.caloriesConsumed),
      unit: 'kcal',
      icon: Flame,
      hint: todayLog ? `${Math.round(todayLog.caloriesConsumed / profile.calorieTarget * 100)}% of target` : 'No log for today',
      progress: todayLog ? todayLog.caloriesConsumed / profile.calorieTarget * 100 : undefined,
    },
    {
      label: 'Protein',
      value: formatNumber(todayLog?.proteinGrams),
      unit: 'g',
      icon: Target,
      hint: todayLog ? `Goal ${profile.proteinTarget} g` : 'No log for today',
      progress: todayLog ? todayLog.proteinGrams / profile.proteinTarget * 100 : undefined,
    },
    {
      label: 'Energy balance',
      value: todayLog ? `${energyBalance(todayLog) > 0 ? '+' : ''}${formatNumber(energyBalance(todayLog))}` : '—',
      unit: 'kcal',
      icon: TrendingDown,
      hint: todayLog ? 'Consumed minus burned' : 'No log for today',
    },
    { label: 'Latest weight', value: formatNumber(latestWeight, 1), unit: 'kg', icon: Scale, hint: latestWeight === null ? 'No weight recorded' : `Target ${profile.targetWeight ?? '—'} kg` },
    { label: 'Latest body fat', value: formatNumber(latestBodyFat, 1), unit: '%', icon: Percent, hint: latestBodyFat === null ? 'No body-fat measurement' : `Target ${profile.targetBodyFat ?? '—'}%` },
  ]

  return <>
    <PageHeader eyebrow="Daily overview" title={`Good evening, ${profile.displayName}`} description="A clear snapshot of your body recomposition progress." />
    {logs.length === 0 ? <EmptyDashboard /> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{statCards.map(({ label, value, unit, icon: Icon, hint, progress }) => <Card key={label} className="gap-4"><CardHeader className="flex-row items-center justify-between"><CardDescription>{label}</CardDescription><span className="rounded-lg bg-accent p-2 text-primary"><Icon size={18} /></span></CardHeader><CardContent><div className="flex items-baseline gap-2"><strong className="text-3xl font-semibold">{value}</strong><span className="text-sm text-muted-foreground">{unit}</span></div><p className="mt-2 text-xs text-muted-foreground">{hint}</p>{progress !== undefined && <Progress value={progress} className="mt-4" />}</CardContent></Card>)}</section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="min-h-[340px]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Weight trend</CardTitle><CardDescription className="mt-1">Latest recorded measurements</CardDescription></div><Badge variant="secondary">Up to 14 records</Badge></CardHeader><CardContent>{weightData.length >= 2 ? <ResponsiveContainer width="100%" height={240}><AreaChart data={weightData}><defs><linearGradient id="weight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-1)" stopOpacity={.25} /><stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="logDate" tickFormatter={formatShortCalendarDate} axisLine={false} tickLine={false} fontSize={11} /><Tooltip /><Area type="monotone" dataKey="weightKg" stroke="var(--chart-1)" strokeWidth={3} fill="url(#weight)" connectNulls={false} /></AreaChart></ResponsiveContainer> : <ChartEmpty message="Record weight on at least two days to see a trend." />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Weekly summary</CardTitle><CardDescription>Average of your latest {recent.length} {recent.length === 1 ? 'log' : 'logs'}</CardDescription></CardHeader><CardContent><div className="space-y-5">{[
          ['Calories consumed', `${formatNumber(caloriesAverage)} kcal`, caloriesAverage === null ? 'No data' : `${formatNumber(caloriesAverage - profile.calorieTarget)} vs target`],
          ['Protein', `${formatNumber(proteinAverage)} g`, proteinAverage === null ? 'No data' : `${Math.round(proteinAverage / profile.proteinTarget * 100)}% target adherence`],
          ['Calories burned', `${formatNumber(burnedAverage)} kcal`, 'User-entered estimate'],
        ].map(([label, value, sub]) => <div key={label} className="flex items-center justify-between border-b pb-4 last:border-0"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground/75">{sub}</p></div><strong>{value}</strong></div>)}</div>{caloriesAverage !== null && burnedAverage !== null && <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent p-4 text-sm text-accent-foreground"><ArrowDownRight size={18} /><span>Your estimated average balance is <strong>{formatNumber(caloriesAverage - burnedAverage)} kcal</strong>.</span></div>}</CardContent></Card>
      </section>
    </>}
  </>
}

function DashboardLoading({ displayName }: { displayName?: string }) {
  return <><PageHeader eyebrow="Daily overview" title={`Good evening${displayName ? `, ${displayName}` : ''}`} description="Loading your latest progress…" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" role="status" aria-label="Loading dashboard"><Skeleton className="h-44" /><Skeleton className="h-44" /><Skeleton className="h-44" /><Skeleton className="h-44" /><Skeleton className="h-44" /></div></>
}

function DashboardError({ message, retry, displayName }: { message: string; retry: () => void; displayName?: string }) {
  return <><PageHeader eyebrow="Daily overview" title={`Good evening${displayName ? `, ${displayName}` : ''}`} /><Card><CardContent className="space-y-4 text-center"><p className="text-sm text-destructive" role="alert">{message}</p><Button variant="outline" onClick={retry}>Try again</Button></CardContent></Card></>
}

function EmptyDashboard() {
  return <Card><CardContent className="py-10 text-center"><p className="font-medium">No daily logs yet</p><p className="mt-2 text-sm text-muted-foreground">Add your first daily log to start building your dashboard.</p></CardContent></Card>
}

function ChartEmpty({ message }: { message: string }) {
  return <div className="grid h-60 place-items-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{message}</div>
}
