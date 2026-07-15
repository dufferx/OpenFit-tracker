import { useState, type ReactNode } from 'react'
import { ChartNoAxesColumnIncreasing, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/common/page-header'
import { ExportDrawer } from '@/components/export/export-drawer'
import { QueryErrorAlert } from '@/components/common/query-error-alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useProgressDailyLogs } from '@/hooks/use-daily-logs'
import { useProfile } from '@/hooks/use-profile'
import {
  createBodyFatChartData,
  createCaloriesChartData,
  createProteinChartData,
  createWeightChartData,
  getProgressDateRange,
  PROGRESS_RANGES,
  type ChartDataPoint,
  type ProgressRange,
} from '@/lib/progress-data'
import { isProfileComplete } from '@/lib/profiles'

const weightConfig = {
  weightKg: { label: 'Weight', color: 'var(--chart-1)', unit: 'kg' },
} satisfies ChartConfig

const bodyFatConfig = {
  bodyFatPercentage: { label: 'Body fat', color: 'var(--chart-2)', unit: '%' },
} satisfies ChartConfig

const caloriesConfig = {
  caloriesConsumed: { label: 'Calories consumed', color: 'var(--chart-1)', unit: 'kcal' },
  totalCaloriesBurned: { label: 'Calories burned', color: 'var(--chart-3)', unit: 'kcal' },
} satisfies ChartConfig

const proteinConfig = {
  proteinGrams: { label: 'Protein', color: 'var(--chart-1)', unit: 'g' },
} satisfies ChartConfig

export function Progress() {
  const [range, setRange] = useState<ProgressRange>('30d')
  const profileQuery = useProfile()
  const profile = isProfileComplete(profileQuery.data) ? profileQuery.data : null
  const boundaries = profile ? getProgressDateRange(range, profile.timezone) : null
  const logsQuery = useProgressDailyLogs(range, boundaries)
  const logs = logsQuery.data ?? []
  const caloriesData = createCaloriesChartData(logs)
  const proteinData = createProteinChartData(logs)
  const weightData = createWeightChartData(logs)
  const bodyFatData = createBodyFatChartData(logs)
  const rangeControl = (
    <div className="mb-5 overflow-x-auto pb-1" aria-label="Progress date range">
      <ToggleGroup
        value={[range]}
        onValueChange={values => values[0] && setRange(values[0] as ProgressRange)}
        disabled={logsQuery.isFetching || profileQuery.isFetching}
        className="w-full min-w-0 sm:w-fit"
      >
        {PROGRESS_RANGES.map(option => <ToggleGroupItem key={option.value} value={option.value} aria-label={`Show ${option.label.toLowerCase()}`} className="min-w-0 flex-1 sm:min-w-20 sm:flex-none">{option.label}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
  )

  if (profileQuery.isPending || (profile && logsQuery.isPending)) return <><PageHeader eyebrow="Trends" title="Progress" description="Loading your progress…" />{rangeControl}<div className="grid gap-5 xl:grid-cols-2" role="status" aria-label="Loading progress charts"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96 xl:col-span-2" /></div></>
  if (profileQuery.isError) return <><PageHeader eyebrow="Trends" title="Progress" />{rangeControl}<QueryError message={profileQuery.error.message} retry={() => void profileQuery.refetch()} /></>
  if (!profile) return <><PageHeader eyebrow="Trends" title="Progress" /><QueryErrorAlert title="Profile setup required" message="A valid profile timezone and fitness targets are required to load progress." /></>
  if (logsQuery.isError) return <><PageHeader eyebrow="Trends" title="Progress" />{rangeControl}<QueryError message={logsQuery.error.message} retry={() => void logsQuery.refetch()} /></>

  return <>
    <PageHeader eyebrow="Trends" title="Progress" description="Focus on trends, not single-day fluctuations." action={<ExportDrawer profile={profile} progressRange={range} />} />
    {rangeControl}
    {range === 'all' && <p className="mb-5 text-xs text-muted-foreground">All time shows up to the 1,000 most recent daily logs available from Supabase.</p>}
    {logs.length === 0 ? <Empty className="bg-card py-10 shadow-sm"><EmptyHeader><EmptyMedia variant="icon"><ChartNoAxesColumnIncreasing aria-hidden="true" /></EmptyMedia><EmptyTitle>No logs in this date range</EmptyTitle><EmptyDescription>Choose another range or add a daily log.</EmptyDescription></EmptyHeader><EmptyContent><Link to="/log" className={buttonVariants()}><Plus aria-hidden="true" />Add daily log</Link></EmptyContent></Empty> : <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Weight" description="Kilograms over time" hasData={weightData.length >= 2} emptyMessage={measurementMessage('weight', weightData.length)}><ChartContainer config={weightConfig}><AreaChart data={weightData} accessibilityLayer><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={value => getTickLabel(weightData, value)} fontSize={11} minTickGap={24} /><YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} width={42} /><ChartTooltip content={<ChartTooltipContent />} /><Area type="monotone" dataKey="weightKg" stroke="var(--color-weightKg)" fill="var(--color-weightKg)" fillOpacity={.12} strokeWidth={3} connectNulls={false} /></AreaChart></ChartContainer></ChartCard>
      <ChartCard title="Body fat" description="Manual measurements" hasData={bodyFatData.length >= 2} emptyMessage={measurementMessage('body fat', bodyFatData.length)}><ChartContainer config={bodyFatConfig}><AreaChart data={bodyFatData} accessibilityLayer><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={value => getTickLabel(bodyFatData, value)} fontSize={11} minTickGap={24} /><YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} width={42} /><ChartTooltip content={<ChartTooltipContent />} /><Area type="monotone" dataKey="bodyFatPercentage" stroke="var(--color-bodyFatPercentage)" fill="var(--color-bodyFatPercentage)" fillOpacity={.12} strokeWidth={3} connectNulls={false} /></AreaChart></ChartContainer></ChartCard>
      <ChartCard title="Calories consumed vs burned" description="Your user-entered totals" className="xl:col-span-2" hasData={caloriesData.length > 0} emptyMessage="No calorie data in this range."><ChartContainer config={caloriesConfig} className="h-80"><BarChart data={caloriesData} accessibilityLayer><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={value => getTickLabel(caloriesData, value)} fontSize={11} minTickGap={24} /><YAxis fontSize={11} width={42} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent items={['caloriesConsumed', 'totalCaloriesBurned']} />} /><Bar dataKey="caloriesConsumed" fill="var(--color-caloriesConsumed)" radius={[7, 7, 0, 0]} /><Bar dataKey="totalCaloriesBurned" fill="var(--color-totalCaloriesBurned)" radius={[7, 7, 0, 0]} /></BarChart></ChartContainer></ChartCard>
      <ChartCard title="Protein consistency" description={`Daily goal: ${profile.proteinTarget} g`} className="xl:col-span-2" hasData={proteinData.length > 0} emptyMessage="No protein data in this range."><ChartContainer config={proteinConfig}><BarChart data={proteinData} accessibilityLayer><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={value => getTickLabel(proteinData, value)} fontSize={11} minTickGap={24} /><YAxis fontSize={11} width={42} /><ChartTooltip content={<ChartTooltipContent />} /><ReferenceLine y={profile.proteinTarget} stroke="var(--chart-2)" strokeDasharray="5 5" label={{ value: `Target: ${profile.proteinTarget} g`, position: 'insideTopRight', fill: 'var(--foreground)', fontSize: 11 }} /><Bar dataKey="proteinGrams" fill="var(--color-proteinGrams)" radius={[7, 7, 0, 0]} /></BarChart></ChartContainer></ChartCard>
    </div>}
  </>
}

function getTickLabel(data: ChartDataPoint[], value: string) {
  return data.find(point => point.logDate === value)?.dateLabel ?? value
}

function measurementMessage(measurement: string, count: number) {
  if (count === 1) return `One ${measurement} measurement is available. Record another day to see a trend.`
  return `No ${measurement} measurements are available in this range.`
}

function QueryError({ message, retry }: { message: string; retry: () => void }) {
  return <QueryErrorAlert message={message} retry={retry} title="Unable to load progress" />
}

function ChartCard({ title, description, className, children, hasData, emptyMessage }: { title: string; description: string; className?: string; children: ReactNode; hasData: boolean; emptyMessage: string }) {
  return <Card className={className}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="min-w-0">{hasData ? children : <Empty className="h-72 gap-3 p-4"><EmptyHeader><EmptyTitle>No chart data yet</EmptyTitle><EmptyDescription>{emptyMessage}</EmptyDescription></EmptyHeader></Empty>}</CardContent></Card>
}
