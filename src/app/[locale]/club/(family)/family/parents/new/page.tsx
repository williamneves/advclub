import { api } from '@/trpc/server'
import { NewParentForm } from '../_components/new-parent-form'
import { notFound } from 'next/navigation'

export default async function NewParentPage() {
  const family = await api.club.families.getLoggedInFamily()

  if (!family) {
    notFound()
  }
  return <NewParentForm familyId={family.id} />
}
