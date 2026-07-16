import { useState } from 'react'
import { Activity, ChevronRight, LogOut, Settings, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import { useAuth } from '@/auth/AuthContext'
import { primaryNavigationItems } from '@/components/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Spinner } from '@/components/ui/spinner'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [accountOpen, setAccountOpen] = useState(false)
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const displayName = accountDisplayName(user)
  const email = user?.email ?? ''
  const initials = accountInitials(displayName, email)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await signOut()
      sileo.success({ title: 'Signed out' })
    } catch (error) {
      sileo.error({ title: 'Unable to sign out', description: getErrorMessage(error) })
      setIsSigningOut(false)
    }
  }

  const openSignOutConfirmation = () => {
    setAccountOpen(false)
    setConfirmSignOutOpen(true)
  }

  const goToSettings = () => {
    setAccountOpen(false)
    navigate('/settings')
  }

  return <Drawer open={accountOpen} onOpenChange={setAccountOpen} showSwipeHandle>
  <div className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-card/85 p-6 backdrop-blur-xl md:block">
      <div className="mb-10 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Activity size={20}/></div>
        <div><p className="font-semibold">OpenFit</p><p className="text-xs text-muted-foreground">Tracker</p></div>
      </div>
      <nav className="space-y-1.5">{primaryNavigationItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({isActive}) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground')}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <div className="rounded-xl border bg-muted/60 p-4 text-xs leading-5 text-muted-foreground"><Badge variant="secondary" className="mb-2">Synced logs</Badge><p>Daily logs are protected by your account and synced with Supabase.</p></div>
        <DrawerTrigger render={<Button variant="outline" className="w-full justify-between" disabled={isSigningOut} aria-label="Open account menu" />}>
          <span className="flex min-w-0 items-center gap-2"><AccountAvatar initials={initials} className="size-6 rounded-md text-[11px]" /><span className="truncate">{displayName}</span></span>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
        </DrawerTrigger>
      </div>
    </aside>
    <div className="fixed right-4 top-4 z-30 md:hidden">
      <DrawerTrigger render={<Button variant="outline" size="icon" className="bg-card/95 shadow-sm" disabled={isSigningOut} aria-label="Open account menu" />}>
        <AccountAvatar initials={initials} className="size-7 rounded-md text-xs" />
      </DrawerTrigger>
    </div>
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-7 md:ml-64 md:px-8 md:pb-10 md:pt-10"><ErrorBoundary homeAction resetKey={`${location.pathname}${location.search}`}><Outlet /></ErrorBoundary></main>
    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border bg-card/95 p-2 shadow-xl backdrop-blur-xl md:hidden">{primaryNavigationItems.map(({to,label,icon:Icon,primary}) => <NavLink key={to} to={to} className={({isActive}) => cn('flex min-w-0 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-medium transition-colors', primary ? '-mt-7 w-14 bg-primary py-3 text-primary-foreground shadow-lg' : isActive ? 'flex-1 bg-accent text-accent-foreground' : 'flex-1 text-muted-foreground')}><Icon size={primary?22:19}/><span className="whitespace-nowrap leading-none">{label}</span></NavLink>)}</nav>
    <AccountDrawerContent
      displayName={displayName}
      email={email}
      initials={initials}
      onSettings={goToSettings}
      onSignOut={openSignOutConfirmation}
    />
    <AlertDialog open={confirmSignOutOpen} onOpenChange={open => {
      if (!isSigningOut) setConfirmSignOutOpen(open)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>You will need to sign in again to view and update your private fitness data.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isSigningOut} onClick={() => void handleSignOut()}>
            {isSigningOut && <Spinner aria-hidden="true" />}
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
  </Drawer>
}

function AccountDrawerContent({
  displayName,
  email,
  initials,
  onSettings,
  onSignOut,
}: {
  displayName: string
  email: string
  initials: string
  onSettings: () => void
  onSignOut: () => void
}) {
  return <DrawerContent className="[--drawer-content-height:auto] [--drawer-content-max-height:calc(100dvh-5.5rem)]">
      <DrawerHeader>
        <DrawerTitle>Account</DrawerTitle>
        <DrawerDescription>Profile navigation and session actions.</DrawerDescription>
      </DrawerHeader>
      <div className="space-y-4 px-4 py-5">
        <div className="flex min-w-0 items-center gap-3 border-b pb-4">
          <AccountAvatar initials={initials} className="size-12 rounded-xl text-base" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{displayName}</p>
            {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
          </div>
        </div>
        <div className="space-y-1">
          <Button variant="ghost" className="h-12 w-full justify-start gap-3" onClick={onSettings}>
            <Settings aria-hidden="true" className="size-5" />
            Settings
          </Button>
          <Button variant="ghost" className="h-12 w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={onSignOut}>
            <LogOut aria-hidden="true" className="size-5" />
            Sign out
          </Button>
        </div>
      </div>
    </DrawerContent>
}

function AccountAvatar({ initials, className }: { initials: string; className?: string }) {
  return <span className={cn('grid shrink-0 place-items-center bg-primary font-semibold text-primary-foreground', className)}>
    {initials || <UserRound aria-hidden="true" className="size-4" />}
  </span>
}

function accountDisplayName(user: ReturnType<typeof useAuth>['user']) {
  const metadata = user?.user_metadata
  const fullName = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : ''
  const name = typeof metadata?.name === 'string' ? metadata.name.trim() : ''
  return fullName || name || user?.email?.split('@')[0] || 'Account'
}

function accountInitials(displayName: string, email: string) {
  const source = displayName === 'Account' ? email : displayName
  const initials = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
  return initials || 'A'
}
