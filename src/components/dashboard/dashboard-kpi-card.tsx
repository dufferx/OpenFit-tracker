import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatNumber } from '@/lib/utils'

export function DashboardKpiCard({ label, value, unit, icon: Icon, target, hint, signed = false }: {
  label: string
  value: number | null
  unit: 'kcal' | 'g'
  icon: LucideIcon
  target?: number
  hint: string
  signed?: boolean
}) {
  const progress = value !== null && target ? value / target * 100 : null
  const formattedValue = value === null ? '—' : `${signed && value > 0 ? '+' : ''}${formatNumber(value)}`

  return <Card className="min-w-0 gap-3 rounded-2xl py-4 shadow-sm md:gap-4 md:py-5">
    <CardHeader className="flex-row items-center gap-2 px-3 md:px-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-primary md:size-9"><Icon className="size-4" aria-hidden="true" /></span>
      <h2 className="min-w-0 text-xs font-medium text-muted-foreground md:text-sm">{label}</h2>
    </CardHeader>
    <CardContent className="min-w-0 px-3 md:px-4">
      <div className="flex min-w-0 items-baseline gap-1 tabular-nums">
        <strong className="text-xl font-semibold tracking-tight md:text-2xl">{formattedValue}</strong>
        {target ? <span className="whitespace-nowrap text-[10px] text-muted-foreground md:text-xs">/ {formatNumber(target)} {unit}</span> : <span className="text-[10px] text-muted-foreground md:text-xs">{unit}</span>}
      </div>
      {progress !== null && <Progress
        value={progress}
        aria-label={`${label} target progress`}
        aria-valuetext={`${formatNumber(value)} of ${formatNumber(target)} ${unit}`}
        className="mt-3 h-1.5"
      />}
      <p className="mt-2 text-[11px] leading-4 text-muted-foreground md:text-xs">{hint}</p>
    </CardContent>
  </Card>
}
