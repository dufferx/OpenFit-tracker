import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type * as React from 'react'

function Spinner({ className, ...props }: React.ComponentProps<typeof LoaderCircle>) {
  return <LoaderCircle role="status" aria-label="Loading" className={cn('size-4 animate-spin', className)} {...props} />
}

export { Spinner }
