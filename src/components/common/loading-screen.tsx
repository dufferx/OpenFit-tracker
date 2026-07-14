import { Activity } from 'lucide-react'

export function LoadingScreen({ label = 'Loading' }: { label?: string }) {
  return <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
    <div className="flex flex-col items-center gap-4 text-center" role="status" aria-live="polite">
      <div className="grid size-12 animate-pulse place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Activity aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground">{label}…</p>
    </div>
  </div>
}
