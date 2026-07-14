import { useState, type ReactNode } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '@/AppContext'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyLogsByRange } from '@/hooks/use-daily-logs'
import { formatShortCalendarDate, subtractCalendarDays, toLocalCalendarDate } from '@/lib/calendar-date'
import { sortLogsChronologically } from '@/lib/daily-log-calculations'

export function Progress() {
  const { profile } = useApp()
  const [range, setRange] = useState(30)
  const today = toLocalCalendarDate()
  const from = subtractCalendarDays(today, range - 1)
  const logsQuery = useDailyLogsByRange(from, today)
  const data = sortLogsChronologically(logsQuery.data ?? [])
  const weightData = data.filter(log => log.weightKg !== null)
  const bodyFatData = data.filter(log => log.bodyFatPercentage !== null)
  const header = <div className="hidden gap-2 sm:flex" aria-label="Progress date range">{[7, 30, 90].map(days => <Button key={days} size="sm" variant={range === days ? 'default' : 'outline'} onClick={() => setRange(days)} disabled={logsQuery.isFetching}>{days} days</Button>)}</div>

  if (logsQuery.isPending) return <><PageHeader eyebrow="Trends" title="Progress" description="Loading your progress…" action={header} /><div className="grid gap-5 xl:grid-cols-2" role="status" aria-label="Loading progress charts"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96 xl:col-span-2" /></div></>
  if (logsQuery.isError) return <><PageHeader eyebrow="Trends" title="Progress" action={header} /><Card><CardContent className="space-y-4 text-center"><p role="alert" className="text-sm text-destructive">{logsQuery.error.message}</p><Button variant="outline" onClick={() => void logsQuery.refetch()}>Try again</Button></CardContent></Card></>

  return <>
    <PageHeader eyebrow="Trends" title="Progress" description="Focus on trends, not single-day fluctuations." action={header} />
    {data.length === 0 ? <Card><CardContent className="py-10 text-center"><p className="font-medium">No logs in this date range</p><p className="mt-2 text-sm text-muted-foreground">Choose another range or add a daily log.</p></CardContent></Card> : <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Weight" description="Kilograms over time" hasData={weightData.length >= 2} emptyMessage="Record weight on at least two days in this range."><ResponsiveContainer width="100%" height={280}><AreaChart data={weightData}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={formatShortCalendarDate} fontSize={11} /><YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} /><Tooltip /><Area type="monotone" dataKey="weightKg" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={.12} strokeWidth={3} connectNulls={false} /></AreaChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Body fat" description="Manual measurements" hasData={bodyFatData.length >= 2} emptyMessage="Record body fat on at least two days in this range."><ResponsiveContainer width="100%" height={280}><AreaChart data={bodyFatData}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={formatShortCalendarDate} fontSize={11} /><YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} /><Tooltip /><Area type="monotone" dataKey="bodyFatPercentage" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={.12} strokeWidth={3} connectNulls={false} /></AreaChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Calories consumed vs burned" description="Your user-entered totals" className="xl:col-span-2" hasData={data.length > 0} emptyMessage="No calorie data in this range."><ResponsiveContainer width="100%" height={320}><BarChart data={data}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={formatShortCalendarDate} fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend /><Bar dataKey="caloriesConsumed" name="Consumed" fill="var(--chart-1)" radius={[7, 7, 0, 0]} /><Bar dataKey="totalCaloriesBurned" name="Burned" fill="var(--chart-3)" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Protein consistency" description={`Daily goal: ${profile.proteinTarget} g`} className="xl:col-span-2" hasData={data.length > 0} emptyMessage="No protein data in this range."><ResponsiveContainer width="100%" height={280}><BarChart data={data}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="logDate" tickFormatter={formatShortCalendarDate} fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="proteinGrams" name="Protein (g)" fill="var(--chart-1)" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
    </div>}
  </>
}

function ChartCard({ title, description, className, children, hasData, emptyMessage }: { title: string; description: string; className?: string; children: ReactNode; hasData: boolean; emptyMessage: string }) {
  return <Card className={className}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{hasData ? children : <div className="grid h-72 place-items-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>}</CardContent></Card>
}
