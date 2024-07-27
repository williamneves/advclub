'use client'

import { useState, useEffect, Suspense } from 'react'
import { NewFamilyForm } from './_components/new-family-form'
import { FamilyCard } from './_components/family-card'
import { InboundBlock } from './_components/inbound-block'
import { api } from '@/trpc/react'
import Loader from '@/components/loader'

// Tipos mock para demonstração
type Family = {
  id: string
  familyName: string
  familyPhone: string
}

export default function Family() {
    const [hasParentAndChild, setHasParentAndChild] = useState(false)
    
    const { data: family, isLoading: isFamilyLoading } = api.club.families.getLoggedInFamily.useQuery()

    if (isFamilyLoading) {
        return <Loader size="md" />
    }

  if (!family) {
    return <NewFamilyForm />
  }

  return (
    <Suspense fallback={<Loader size="md" />}>
      <FamilyCard
        family={family}
      />
      {(!family.parents?.length || !family.kids?.length) && <InboundBlock />}
    </Suspense>
  )
}
