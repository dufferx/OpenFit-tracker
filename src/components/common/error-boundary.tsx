import { Component, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react'
import { CircleAlert, House, RefreshCw } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ErrorBoundaryProps = {
  children: ReactNode
  homeAction?: boolean
  resetKey?: string
}

type ErrorBoundaryState = { hasError: boolean }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Unexpected render error:', error, info)
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  retry = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) return <UnexpectedErrorFallback onRetry={this.retry} homeAction={this.props.homeAction} />
    return this.props.children
  }
}

export function UnexpectedErrorFallback({ onRetry, homeAction = false }: { onRetry: () => void; homeAction?: boolean }) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => titleRef.current?.focus(), [])

  return <main className="grid min-h-[60vh] place-items-center bg-background p-6 text-foreground">
    <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm" aria-labelledby="unexpected-error-title">
      <div className="mx-auto grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive"><CircleAlert aria-hidden="true" /></div>
      <h1 ref={titleRef} id="unexpected-error-title" tabIndex={-1} className="mt-4 text-xl font-semibold outline-none">Something went wrong</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">OpenFit could not display this view. Your saved data has not been changed.</p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Button type="button" onClick={onRetry}><RefreshCw aria-hidden="true" />Try again</Button>
        {homeAction && <a href="/" className={cn(buttonVariants({ variant: 'outline' }))}><House aria-hidden="true" />Back to Home</a>}
      </div>
    </section>
  </main>
}
