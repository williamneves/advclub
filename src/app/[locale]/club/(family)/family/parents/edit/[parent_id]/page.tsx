import { api } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { EditParentForm } from '../../_components/edit-parent-form'

export const dynamic = 'force-dynamic'

export default async function EditParentPage({
  params,
}: {
  params: { parent_id: string }
}) {
  const parent = await api.club.parents.getParentById({
    id: Number(params.parent_id),
  })

  if (!parent) {
    notFound()
  }

  console.log(parent)

  return <EditParentForm parent={parent} />
}
