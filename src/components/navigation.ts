import { BarChart3, CalendarDays, Home, Plus, Trophy, type LucideIcon } from 'lucide-react'

export type PrimaryNavigationItem = {
  to: string
  label: string
  icon: LucideIcon
  primary?: boolean
}

export const primaryNavigationItems: PrimaryNavigationItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/log', label: 'Log', icon: Plus, primary: true },
  { to: '/history', label: 'History', icon: CalendarDays },
  { to: '/gym-league', label: 'Gym League', icon: Trophy },
]
