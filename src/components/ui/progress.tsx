import { cn } from '@/lib/utils'
export function Progress({ value=0, className }: { value?: number; className?: string }) { return <div data-slot="progress" className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/15',className)}><div className="h-full bg-primary transition-all" style={{width:`${Math.min(100,Math.max(0,value))}%`}}/></div> }
