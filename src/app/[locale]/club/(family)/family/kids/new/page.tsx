import { api } from '@/trpc/server'
import { NewKidForm } from '../_components/new-kid-form'
import { notFound } from 'next/navigation'

export default async function NewKidPage() {
  const family = await api.club.families.getLoggedInFamily()

  if (!family) {
    notFound()
  }

  return <NewKidForm familyId={family.id} familyUUID={family.uuid} />
}
