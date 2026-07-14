import { ArrowDownRight, Flame, Gauge, Percent, Scale, Target, TrendingDown } from 'lucide-react'
import { Area, AreaChart, XAxis } from 'recharts'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyLogs } from '@/hooks/use-daily-logs'
import { useProfile } from '@/hooks/use-profile'
import { todayInTimeZone } from '@/lib/calendar-date'
import { energyBalance, latestMeasurement } from '@/lib/daily-log-calculations'
import { calculateWeeklySummary, createWeightChartData } from '@/lib/progress-data'
import { isProfileComplete } from '@/lib/profiles'
import { formatNumber } from '@/lib/utils'

const weightChartConfig = {
  weightKg: { label: 'Weight', color: 'var(--chart-1)', unit: 'kg' },
} satisfies ChartConfig

export function Dashboard() {
  const logsQuery = useDailyLogs()
  const profileQuery = useProfile()

  if (logsQuery.isPending || profileQuery.isPending) return <DashboardLoading displayName={profileQuery.data?.displayName} />
  if (logsQuery.isError) return <DashboardError message={logsQuery.error.message} retry={() => void logsQuery.refetch()} displayName={profileQuery.data?.displayName} />
  if (profileQuery.isError) return <DashboardError message={profileQuery.error.message} retry={() => void profileQuery.refetch()} />
  if (!isProfileComplete(profileQuery.data)) return <DashboardError message="Complete your profile before viewing target calculations." retry={() => void profileQuery.refetch()} />

  const logs = logsQuery.data
  const profile = profileQuery.data
  const todayLog = logs.find(log => log.logDate === todayInTimeZone(profile.timezone))
  const weekly = calculateWeeklySummary(logs, profile.timezone)
  const latestWeight = latestMeasurement(logs, 'weightKg')
  const latestBodyFat = latestMeasurement(logs, 'bodyFatPercentage')
  const weightData = createWeightChartData(logs, 14)

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
      label: 'Calories burned',
      value: formatNumber(todayLog?.totalCaloriesBurned),
      unit: 'kcal',
      icon: Gauge,
      hint: todayLog ? 'User-entered total' : 'No log for today',
    },
    {
      label: 'Estimated balance',
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
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{statCards.map(({ label, value, unit, icon: Icon, hint, progress }) => <Card key={label} className="gap-4"><CardHeader className="flex-row items-center justify-between"><CardDescription>{label}</CardDescription><span className="rounded-lg bg-accent p-2 text-primary"><Icon size={18} /></span></CardHeader><CardContent><div className="flex items-baseline gap-2"><strong className="text-3xl font-semibold">{value}</strong><span className="text-sm text-muted-foreground">{unit}</span></div><p className="mt-2 text-xs text-muted-foreground">{hint}</p>{progress !== undefined && <Progress value={progress} aria-label={`${label}: ${Math.round(progress)}% of target`} className="mt-4" />}</CardContent></Card>)}</section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="min-h-[340px]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Weight trend</CardTitle><CardDescription className="mt-1">Latest recorded measurements</CardDescription></div><Badge variant="secondary">Up to 14 records</Badge></CardHeader><CardContent>{weightData.length >= 2 ? <ChartContainer config={weightChartConfig} className="h-60"><AreaChart data={weightData} accessibilityLayer><defs><linearGradient id="weight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-weightKg)" stopOpacity={.25} /><stop offset="95%" stopColor="var(--color-weightKg)" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="logDate" tickFormatter={value => weightData.find(point => point.logDate === value)?.dateLabel ?? value} axisLine={false} tickLine={false} fontSize={11} minTickGap={24} /><ChartTooltip content={<ChartTooltipContent />} /><Area type="monotone" dataKey="weightKg" stroke="var(--color-weightKg)" strokeWidth={3} fill="url(#weight)" connectNulls={false} /></AreaChart></ChartContainer> : <ChartEmpty message="Record weight on at least two days to see a trend." />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Weekly summary</CardTitle><CardDescription>Average across {weekly.loggedDays} of {weekly.totalDays} days</CardDescription></CardHeader><CardContent><div className="space-y-5">{[
          ['Calories consumed', `${formatNumber(weekly.averageCaloriesConsumed)} kcal`, weekly.averageCaloriesConsumed === null ? 'No data' : `${formatNumber(weekly.averageCaloriesConsumed - profile.calorieTarget)} vs target`],
          ['Protein', `${formatNumber(weekly.averageProteinGrams)} g`, weekly.averageProteinGrams === null ? 'No data' : `${Math.round(weekly.averageProteinGrams / profile.proteinTarget * 100)}% target adherence`],
          ['Calories burned', `${formatNumber(weekly.averageCaloriesBurned)} kcal`, 'User-entered estimate'],
          ['Estimated energy balance', `${weekly.averageEnergyBalance !== null && weekly.averageEnergyBalance > 0 ? '+' : ''}${formatNumber(weekly.averageEnergyBalance)} kcal`, 'Consumed minus burned'],
        ].map(([label, value, sub]) => <div key={label} className="flex items-center justify-between gap-4 border-b pb-4 last:border-0"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground/75">{sub}</p></div><strong className="text-right">{value}</strong></div>)}</div>{weekly.averageEnergyBalance !== null && <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent p-4 text-sm text-accent-foreground"><ArrowDownRight size={18} /><span>Your estimated average balance is <strong>{weekly.averageEnergyBalance > 0 ? '+' : ''}{formatNumber(weekly.averageEnergyBalance)} kcal</strong>.</span></div>}</CardContent></Card>
      </section>
    </>}
  </>
}

function DashboardLoading({ displayName }: { displayName?: string }) {
  return <><PageHeader eyebrow="Daily overview" title={`Good evening${displayName ? `, ${displayName}` : ''}`} description="Loading your latest progress…" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" role="status" aria-label="Loading dashboard">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-44" />)}</div></>
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
