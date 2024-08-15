import { api, HydrateClient } from '@/trpc/server'
import { notFound, redirect } from 'next/navigation'
import { CreateKids } from '../../_components/create-kids'

export const dynamic = 'force-dynamic'

export default async function EditKidPage({
  params,
}: {
  params: { kid_id: string }
}) {
  const family = await api.club.families.getLoggedInFamily()

  if (!family) {
    redirect('/login')
  }

  const kid = await api.club.kids.getKidById({
    id: Number(params.kid_id),
  })

  if (!kid) {
    notFound()
  }

  void (await api.club.kids.getKidById.prefetch({
    id: Number(params.kid_id),
  }))

  return (
    <HydrateClient>
      <CreateKids
        isFirstKid={false}
        familyId={family.id}
        familyUUID={family.uuid}
        kidId={kid.id}
        mode="edit"
      />
    </HydrateClient>
  )
}
