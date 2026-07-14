import type { ReactNode } from 'react'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
    <div className="w-full max-w-md">
      <div className="mb-7 flex items-center justify-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><Activity aria-hidden="true" /></div>
        <div><p className="font-semibold">OpenFit</p><p className="text-xs text-muted-foreground">Tracker</p></div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  </main>
}
