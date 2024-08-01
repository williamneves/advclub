import { Suspense } from 'react'
import { FamilyCard } from './_components/family-card'
import { InboundBlock } from './_components/inbound-block'
import { api } from '@/trpc/server'
import Loader from '@/components/loader'
import { redirect } from 'next/navigation'

// Tipos mock para demonstração
type Family = {
  id: string
  familyName: string
  familyPhone: string
}

export default async function Family() {
  const family = await api.club.families.getLoggedInFamily()

  if (!family) {
    redirect('/club/family/new_family')
  }

  return (
    <Suspense fallback={<Loader size="md" />}>
      <FamilyCard family={family} />
      <InboundBlock
        familyHasParents={!!family.parents?.length}
        familyHasChildren={!!family.kids?.length}
      />
    </Suspense>
  )
}
