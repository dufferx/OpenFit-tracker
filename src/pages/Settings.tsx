import { useTheme } from 'next-themes'
import { sileo } from 'sileo'
import { ProfileForm } from '@/components/profile/profile-form'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile, useUpdateProfile } from '@/hooks/use-profile'
import { getErrorMessage } from '@/lib/errors'
import type { ProfileInput } from '@/types/models'

export function SettingsPage() {
  const profileQuery = useProfile()
  const updateProfile = useUpdateProfile()
  const { setTheme } = useTheme()

  const save = async (input: ProfileInput) => {
    try {
      await updateProfile.mutateAsync(input)
      setTheme(input.theme)
      sileo.success({ title: 'Settings saved', description: 'Your profile and targets have been synced.' })
    } catch (error) {
      sileo.error({ title: 'Unable to save settings', description: getErrorMessage(error) })
    }
  }

  if (profileQuery.isPending) return <><PageHeader eyebrow="Preferences" title="Settings" description="Loading your profile…" /><div className="grid gap-5 xl:grid-cols-2" role="status" aria-label="Loading profile settings"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></>
  if (profileQuery.isError) return <><PageHeader eyebrow="Preferences" title="Settings" /><Card><CardContent className="space-y-4 text-center"><p role="alert" className="text-sm text-destructive">{profileQuery.error.message}</p><Button variant="outline" onClick={() => void profileQuery.refetch()}>Try again</Button></CardContent></Card></>

  return <><PageHeader eyebrow="Preferences" title="Settings" description="Adjust your personal targets and profile." /><ProfileForm profile={profileQuery.data} submitLabel="Save settings" pendingLabel="Saving…" isPending={updateProfile.isPending} onSubmit={save} /></>
}
