import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export function DashboardHeader({ dateLabel, greeting, displayName }: {
  dateLabel: string
  greeting: string
  displayName: string
}) {
  return <header className="mb-5 flex items-end justify-between gap-4 md:mb-6">
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground md:text-sm">{dateLabel}</p>
      <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight md:text-3xl">{greeting}, {displayName}</h1>
    </div>
    <div className="hidden md:block">
      <Link to="/log" className={buttonVariants()}>
        <Plus aria-hidden="true" />
        Add daily log
      </Link>
    </div>
  </header>
}
