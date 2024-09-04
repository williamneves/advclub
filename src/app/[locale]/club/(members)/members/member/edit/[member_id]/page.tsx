import { api, HydrateClient } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { CreateMember } from '../../_components/create-members'

export const dynamic = 'force-dynamic'

export default async function EditMemberPage({
  params,
}: {
  params: { member_id: string }
}) {
  const member = await api.club.members.getMemberById({
    id: Number(params.member_id),
  })

  if (!member) {
    notFound()
  }

  void (await api.club.members.getMemberById.prefetch({
    id: Number(params.member_id),
  }))

  return (
    <HydrateClient>
      <CreateMember memberId={member.id} mode="edit" />
    </HydrateClient>
  )
}
