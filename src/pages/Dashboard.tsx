import { Flame, Gauge, Target, TrendingDown } from 'lucide-react'
import { DashboardEmptyNotice } from '@/components/dashboard/dashboard-empty-notice'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardKpiCard } from '@/components/dashboard/dashboard-kpi-card'
import { WeeklySummaryCard } from '@/components/dashboard/weekly-summary-card'
import { WeightTrendCard } from '@/components/dashboard/weight-trend-card'
import { PageHeader } from '@/components/common/page-header'
import { QueryErrorAlert } from '@/components/common/query-error-alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyLogs } from '@/hooks/use-daily-logs'
import { useProfile } from '@/hooks/use-profile'
import { formatDashboardCalendarDate, greetingInTimeZone, todayInTimeZone } from '@/lib/calendar-date'
import { energyBalance, latestMeasurement } from '@/lib/daily-log-calculations'
import { calculateWeeklySummary, createWeightChartData } from '@/lib/progress-data'
import { isProfileComplete } from '@/lib/profiles'
import { formatNumber } from '@/lib/utils'

export function Dashboard() {
  const logsQuery = useDailyLogs()
  const profileQuery = useProfile()

  if (logsQuery.isPending || profileQuery.isPending) return <DashboardLoading />
  if (logsQuery.isError) return <DashboardError message={logsQuery.error.message} retry={() => void logsQuery.refetch()} />
  if (profileQuery.isError) return <DashboardError message={profileQuery.error.message} retry={() => void profileQuery.refetch()} />
  if (!isProfileComplete(profileQuery.data)) return <DashboardError message="Complete your profile before viewing target calculations." retry={() => void profileQuery.refetch()} />

  const logs = logsQuery.data
  const profile = profileQuery.data
  const today = todayInTimeZone(profile.timezone)
  const todayLog = logs.find(log => log.logDate === today)
  const weekly = calculateWeeklySummary(logs, profile.timezone)
  const latestWeight = latestMeasurement(logs, 'weightKg')
  const latestBodyFat = latestMeasurement(logs, 'bodyFatPercentage')
  const weightData = createWeightChartData(logs, 14)
  const balance = todayLog ? energyBalance(todayLog) : null

  return <>
    <DashboardHeader
      dateLabel={formatDashboardCalendarDate(today)}
      greeting={greetingInTimeZone(profile.timezone)}
      displayName={profile.displayName}
    />
    {logs.length === 0 && <DashboardEmptyNotice />}
    <section aria-labelledby="today-summary-title">
      <h2 id="today-summary-title" className="sr-only">Today&apos;s summary</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <DashboardKpiCard
          label="Calories consumed"
          value={todayLog?.caloriesConsumed ?? null}
          unit="kcal"
          icon={Flame}
          target={profile.calorieTarget}
          hint={targetHint(todayLog?.caloriesConsumed ?? null, profile.calorieTarget, 'kcal')}
        />
        <DashboardKpiCard
          label="Protein"
          value={todayLog?.proteinGrams ?? null}
          unit="g"
          icon={Target}
          target={profile.proteinTarget}
          hint={targetHint(todayLog?.proteinGrams ?? null, profile.proteinTarget, 'g')}
        />
        <DashboardKpiCard
          label="Calories burned"
          value={todayLog?.totalCaloriesBurned ?? null}
          unit="kcal"
          icon={Gauge}
          hint={todayLog ? 'User-entered total calories burned' : 'No log for today'}
        />
        <DashboardKpiCard
          label="Estimated balance"
          value={balance}
          unit="kcal"
          icon={TrendingDown}
          hint={todayLog ? 'Consumed minus burned' : 'No log for today'}
          signed
        />
      </div>
    </section>
    <section className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)]" aria-label="Measurements and weekly summary">
      <WeightTrendCard
        data={weightData}
        latestWeight={latestWeight}
        targetWeight={profile.targetWeight}
        latestBodyFat={latestBodyFat}
        targetBodyFat={profile.targetBodyFat}
      />
      <WeeklySummaryCard summary={weekly} calorieTarget={profile.calorieTarget} proteinTarget={profile.proteinTarget} />
    </section>
  </>
}

function targetHint(value: number | null, target: number, unit: 'kcal' | 'g') {
  if (value === null) return 'No log for today'
  const difference = target - value
  if (difference > 0) return `${formatNumber(difference)} ${unit} remaining`
  if (difference < 0) return `${formatNumber(Math.abs(difference))} ${unit} over target`
  return 'Target reached'
}

function DashboardLoading() {
  return <div role="status" aria-label="Loading dashboard">
    <div className="mb-5 space-y-2 md:mb-6"><Skeleton className="h-4 w-32" /><Skeleton className="h-9 w-72 max-w-full" /></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />)}</div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)]"><Skeleton className="h-[26rem] rounded-2xl" /><Skeleton className="h-[26rem] rounded-2xl" /></div>
  </div>
}

function DashboardError({ message, retry }: { message: string; retry: () => void }) {
  return <><PageHeader eyebrow="Daily overview" title="Dashboard" /><QueryErrorAlert message={message} retry={retry} title="Unable to load dashboard" /></>
}
