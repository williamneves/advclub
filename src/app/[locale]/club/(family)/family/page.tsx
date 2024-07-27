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
  const family = api.club.families.getLoggedInFamily.useQuery(undefined, {
    retry: 1,
  })

  if (family.isLoading) {
    return <Loader size="md" />
  }

  if (family.status !== 'success' || !family.data) {
    return <NewFamilyForm />
  }

  return (
    <Suspense fallback={<Loader size="md" />}>
      <FamilyCard family={family.data} />
      <InboundBlock
        familyHasParents={!!family.data?.parents?.length}
        familyHasChildren={!!family.data?.kids?.length}
      />
    </Suspense>
  )
}
