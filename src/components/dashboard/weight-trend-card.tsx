import { CartesianGrid, Area, AreaChart, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { formatNumber } from '@/lib/utils'
import type { WeightChartPoint } from '@/lib/progress-data'

const weightChartConfig = {
  weightKg: { label: 'Weight', color: 'var(--chart-1)', unit: 'kg' },
} satisfies ChartConfig

export function WeightTrendCard({ data, latestWeight, targetWeight, latestBodyFat, targetBodyFat }: {
  data: WeightChartPoint[]
  latestWeight: number | null
  targetWeight: number | null
  latestBodyFat: number | null
  targetBodyFat: number | null
}) {
  return <Card className="min-w-0 gap-4 rounded-2xl py-5 shadow-sm md:gap-5 md:py-6">
    <CardHeader className="gap-4 px-4 md:px-6">
      <div>
        <CardTitle><h2>Weight trend</h2></CardTitle>
        <CardDescription className="mt-1">Latest recorded measurements</CardDescription>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:max-w-lg">
        <MeasurementSummary label="Latest weight" value={latestWeight} unit="kg" target={targetWeight} />
        <MeasurementSummary label="Latest body fat" value={latestBodyFat} unit="%" target={targetBodyFat} />
      </div>
    </CardHeader>
    <CardContent className="min-w-0 px-4 md:px-6">
      {data.length >= 2 ? <ChartContainer config={weightChartConfig} className="h-28 sm:h-44 xl:h-64">
        <AreaChart data={data} accessibilityLayer margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
          <defs><linearGradient id="dashboard-weight-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-weightKg)" stopOpacity={.24} /><stop offset="95%" stopColor="var(--color-weightKg)" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="logDate" tickFormatter={value => data.find(point => point.logDate === value)?.dateLabel ?? value} axisLine={false} tickLine={false} fontSize={11} minTickGap={24} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="weightKg" stroke="var(--color-weightKg)" strokeWidth={3} fill="url(#dashboard-weight-gradient)" connectNulls={false} dot={false} activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer> : <WeightEmptyState count={data.length} />}
    </CardContent>
  </Card>
}

function MeasurementSummary({ label, value, unit, target }: {
  label: string
  value: number | null
  unit: 'kg' | '%'
  target: number | null
}) {
  return <div className="min-w-0 rounded-xl bg-muted/60 p-3">
    <p className="truncate text-[11px] text-muted-foreground md:text-xs">{label}</p>
    <p className="mt-1 text-sm font-semibold tabular-nums md:text-base">{formatNumber(value, 1)} <span className="text-xs font-normal text-muted-foreground">{unit}</span></p>
    <p className="mt-1 truncate text-[10px] text-muted-foreground md:text-xs">Target {formatNumber(target, 1)} {unit}</p>
  </div>
}

function WeightEmptyState({ count }: { count: number }) {
  return <Empty className="h-28 gap-3 p-4 sm:h-44 xl:h-64">
    <EmptyHeader>
      <EmptyTitle>{count === 1 ? 'One weight measurement recorded' : 'No weight measurements yet'}</EmptyTitle>
      <EmptyDescription>{count === 1 ? 'Record weight on another day to see a trend.' : 'Add weight to a daily log to start your trend.'}</EmptyDescription>
    </EmptyHeader>
  </Empty>
}
