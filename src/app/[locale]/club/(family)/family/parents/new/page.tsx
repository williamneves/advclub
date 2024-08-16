import { api } from '@/trpc/server'
import { NewParentForm } from '../_components/new-parent-form'
import { notFound } from 'next/navigation'
import { CreateParent } from '../_components/create-parent'

export default async function NewParentPage() {
  const family = await api.club.families.getLoggedInFamily()

  if (!family) {
    notFound()
  }

  // return <NewParentForm familyId={family.id} familyUUID={family.uuid} isFirstParent={family.parents.length === 0} />
  return (
    <CreateParent
      familyId={family.id}
      familyUUID={family.uuid}
      mode="new"
      isFirstParent={family.parents.length === 0}
    />
  )
}
