import { EqualApproximately } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { WeeklySummary } from '@/lib/progress-data'
import { formatNumber } from '@/lib/utils'

export function WeeklySummaryCard({ summary, calorieTarget, proteinTarget }: {
  summary: WeeklySummary
  calorieTarget: number
  proteinTarget: number
}) {
  const rows = [
    {
      label: 'Average calories',
      value: `${formatNumber(summary.averageCaloriesConsumed)} kcal`,
      detail: summary.averageCaloriesConsumed === null ? 'No data recorded' : `${formatSigned(summary.averageCaloriesConsumed - calorieTarget)} kcal vs target`,
    },
    {
      label: 'Average protein',
      value: `${formatNumber(summary.averageProteinGrams)} g`,
      detail: summary.averageProteinGrams === null ? 'No data recorded' : `${Math.round(summary.averageProteinGrams / proteinTarget * 100)}% of target`,
    },
    {
      label: 'Average calories burned',
      value: `${formatNumber(summary.averageCaloriesBurned)} kcal`,
      detail: summary.averageCaloriesBurned === null ? 'No data recorded' : 'User-entered daily total',
    },
    {
      label: 'Average estimated balance',
      value: `${formatSigned(summary.averageEnergyBalance)} kcal`,
      detail: summary.averageEnergyBalance === null ? 'No data recorded' : 'Consumed minus burned',
    },
  ]

  return <Card className="h-full gap-4 rounded-2xl py-5 shadow-sm md:gap-5 md:py-6">
    <CardHeader className="px-4 md:px-6">
      <CardTitle><h2>Weekly summary</h2></CardTitle>
      <CardDescription>Average across {summary.loggedDays} of {summary.totalDays} days</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col px-4 md:px-6">
      <div className="flex-1">{rows.map(row => <div key={row.label} className="flex items-center justify-between gap-4 border-b py-3 first:pt-0 last:border-0">
        <div className="min-w-0"><p className="text-sm font-medium">{row.label}</p><p className="mt-1 text-xs text-muted-foreground">{row.detail}</p></div>
        <strong className="shrink-0 text-right text-sm tabular-nums md:text-base">{row.value}</strong>
      </div>)}</div>
      {summary.averageEnergyBalance !== null && <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent p-3 text-xs leading-5 text-accent-foreground md:text-sm">
        <EqualApproximately className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>Estimated average balance: <strong>{formatSigned(summary.averageEnergyBalance)} kcal</strong> consumed minus burned.</span>
      </div>}
    </CardContent>
  </Card>
}

function formatSigned(value: number | null) {
  if (value === null) return '—'
  return `${value > 0 ? '+' : ''}${formatNumber(value)}`
}
