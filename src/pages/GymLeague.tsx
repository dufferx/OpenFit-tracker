import { Trophy } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function GymLeaguePage() {
  return <>
    <PageHeader
      eyebrow="Friendly competition"
      title="Gym League"
      description="Private attendance competitions between friends will be available here."
    />
    <Card className="max-w-3xl">
      <CardContent className="py-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Trophy aria-hidden="true" /></EmptyMedia>
            <EmptyTitle>Gym League is coming soon</EmptyTitle>
            <EmptyDescription>
              This temporary screen keeps the authenticated navigation ready while league creation, attendance tracking, and rankings remain deferred.
            </EmptyDescription>
          </EmptyHeader>
          <Badge variant="secondary" className="mt-2">Placeholder</Badge>
        </Empty>
      </CardContent>
    </Card>
  </>
}
