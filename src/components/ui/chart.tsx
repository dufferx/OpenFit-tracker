import { createContext, useContext, type CSSProperties, type ReactElement } from 'react'
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipContentProps,
} from 'recharts'
import { formatCalendarDate } from '@/lib/calendar-date'
import { cn } from '@/lib/utils'

export type ChartConfig = Record<string, {
  label: string
  color: string
  unit: 'kcal' | 'g' | 'kg' | '%'
}>

const ChartContext = createContext<ChartConfig | null>(null)

function useChartConfig() {
  const config = useContext(ChartContext)
  if (!config) throw new Error('Chart components must be used within ChartContainer.')
  return config
}

function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig
  className?: string
  children: ReactElement
}) {
  const colorVariables = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [`--color-${key}`, item.color]),
  ) as CSSProperties

  return (
    <ChartContext.Provider value={config}>
      <div
        data-slot="chart"
        className={cn('h-72 w-full min-w-0 text-xs', className)}
        style={colorVariables}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltipContent({ active, label, payload }: Partial<TooltipContentProps<number, string>>) {
  const config = useChartConfig()
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-36 rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-2 font-medium">{typeof label === 'string' ? formatCalendarDate(label) : label}</p>
      <div className="space-y-1.5">
        {payload.map(item => {
          const key = typeof item.dataKey === 'string' ? item.dataKey : ''
          const itemConfig = config[key]
          if (!itemConfig || item.value === undefined || item.value === null) return null

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color ?? itemConfig.color }} />
                {itemConfig.label}
              </span>
              <span className="font-mono font-medium tabular-nums">
                {new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(Number(item.value))} {itemConfig.unit}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartLegendContent({ items }: { items: string[] }) {
  const config = useChartConfig()

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
      {items.map(key => <span key={key} className="flex items-center gap-2 text-muted-foreground"><span className="size-2.5 rounded-sm" style={{ backgroundColor: config[key].color }} />{config[key].label}</span>)}
    </div>
  )
}

const ChartTooltip = RechartsTooltip
const ChartLegend = RechartsLegend

export { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent }
