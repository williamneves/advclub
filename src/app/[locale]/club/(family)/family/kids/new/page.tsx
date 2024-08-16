import { api } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { CreateKids } from '../_components/create-kids'

export default async function NewKidPage() {
  const family = await api.club.families.getLoggedInFamily()

  if (!family) {
    notFound()
  }

  return (
    <CreateKids
      isFirstKid={family.kids.length === 0}
      familyId={family.id}
      familyUUID={family.uuid}
      mode="new"
    />
  )
}
