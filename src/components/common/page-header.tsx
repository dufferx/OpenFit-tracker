import type { ReactNode } from 'react'
export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-7 flex items-end justify-between gap-4"><div>{eyebrow&&<p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-primary">{eyebrow}</p>}<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>{description&&<p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>{action}</div>
}
