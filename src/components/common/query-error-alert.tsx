import { CircleAlert } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function QueryErrorAlert({ message, retry, title = 'Unable to load data', className }: {
  message: string
  retry?: () => void
  title?: string
  className?: string
}) {
  return <Alert variant="destructive" className={className}>
    <CircleAlert aria-hidden="true" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
    {retry && <AlertAction><Button type="button" variant="outline" onClick={retry}>Try again</Button></AlertAction>}
  </Alert>
}
