import { api } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { EditKidForm } from '../../_components/edit-kid-form'

export default async function EditKidPage({
  params,
}: {
  params: { kid_id: string }
}) {
  const kid = await api.club.kids.getKidById({ id: parseInt(params.kid_id) })

  if (!kid) {
    notFound()
  }
  return <EditKidForm kid={kid} />
}
