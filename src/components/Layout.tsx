import { useState } from 'react'
import { Activity, BarChart3, CalendarDays, Home, LogOut, Plus, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { sileo } from 'sileo'
import { useAuth } from '@/auth/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/log', label: 'Log', icon: Plus, primary: true },
  { to: '/history', label: 'History', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Layout() {
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      sileo.success({ title: 'Signed out' })
    } catch (error) {
      sileo.error({ title: 'Unable to sign out', description: getErrorMessage(error) })
      setIsSigningOut(false)
    }
  }

  return <div className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-card/85 p-6 backdrop-blur-xl md:block">
      <div className="mb-10 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Activity size={20}/></div>
        <div><p className="font-semibold">OpenFit</p><p className="text-xs text-muted-foreground">Tracker</p></div>
      </div>
      <nav className="space-y-1.5">{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({isActive}) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground')}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <div className="rounded-xl border bg-muted/60 p-4 text-xs leading-5 text-muted-foreground"><Badge variant="secondary" className="mb-2">Synced logs</Badge><p>Daily logs are protected by your account and synced with Supabase.</p></div>
        <p className="truncate px-1 text-xs text-muted-foreground" title={user?.email}>{user?.email}</p>
        <Button variant="outline" className="w-full" onClick={handleSignOut} disabled={isSigningOut}>{isSigningOut ? <Spinner aria-hidden="true" /> : <LogOut aria-hidden="true" />}{isSigningOut ? 'Signing out…' : 'Sign out'}</Button>
      </div>
    </aside>
    <Button variant="outline" size="icon" className="fixed right-4 top-4 z-30 bg-card/95 shadow-sm md:hidden" onClick={handleSignOut} disabled={isSigningOut} aria-label={isSigningOut ? 'Signing out' : 'Sign out'}>{isSigningOut ? <Spinner aria-hidden="true" /> : <LogOut aria-hidden="true" />}</Button>
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-7 md:ml-64 md:px-8 md:pb-10 md:pt-10"><Outlet/></main>
    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border bg-card/95 p-2 shadow-xl backdrop-blur-xl md:hidden">{items.map(({to,label,icon:Icon,primary}) => <NavLink key={to} to={to} className={({isActive}) => cn('flex min-w-14 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors', primary ? '-mt-7 bg-primary py-3 text-primary-foreground shadow-lg' : isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}><Icon size={primary?22:19}/>{label}</NavLink>)}</nav>
  </div>
}
