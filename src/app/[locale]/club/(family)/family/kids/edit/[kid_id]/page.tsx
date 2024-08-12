import { api, HydrateClient } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { EditKidForm } from '../../_components/edit-kid-form'

export default async function EditKidPage({
  params,
}: {
  params: { kid_id: string }
}) {
  void (await api.club.kids.getKidById.prefetch({
    id: parseInt(params.kid_id),
  }))
  const kid = await api.club.kids.getKidById({ id: parseInt(params.kid_id) })

  if (!kid) {
    notFound()
  }
  return (
    <HydrateClient>
      <EditKidForm kidId={params.kid_id} />
    </HydrateClient>
  )
}
