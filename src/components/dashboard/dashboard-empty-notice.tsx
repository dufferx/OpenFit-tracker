import { ChartNoAxesColumnIncreasing } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function DashboardEmptyNotice() {
  return <Empty className="mb-4 flex-row justify-start gap-3 border-solid bg-card p-4 text-left shadow-sm md:mb-5">
    <EmptyMedia variant="icon"><ChartNoAxesColumnIncreasing aria-hidden="true" /></EmptyMedia>
    <EmptyHeader className="items-start gap-1"><EmptyTitle>No daily logs yet</EmptyTitle><EmptyDescription>Add your first daily totals to start building this dashboard.</EmptyDescription></EmptyHeader>
  </Empty>
}
