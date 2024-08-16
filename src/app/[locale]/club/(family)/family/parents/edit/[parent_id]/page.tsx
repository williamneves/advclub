import { api, HydrateClient } from '@/trpc/server'
import { notFound, redirect } from 'next/navigation'
import { EditParentForm } from '../../_components/edit-parent-form'
import { CreateParent } from '../../_components/create-parent'

export const dynamic = 'force-dynamic'

export default async function EditParentPage({
  params,
}: {
  params: { parent_id: string }
}) {
  const family = await api.club.families.getLoggedInFamily()

  if (!family) {
    redirect('/login')
  }

  const parent = await api.club.parents.getParentById({
    id: Number(params.parent_id),
  })

  if (!parent) {
    notFound()
  }

  void (await api.club.parents.getParentById.prefetch({
    id: Number(params.parent_id),
  }))

  return (
    <HydrateClient>
      <CreateParent
        isFirstParent={false}
        familyId={family.id}
        familyUUID={family.uuid}
        parentId={parent.id}
        mode="edit"
      />
    </HydrateClient>
  )
}
