import { FamilyCard } from './_components/family-card'
import { InboundBlock } from './_components/inbound-block'
import { api } from '@/trpc/server'

import { Stack } from '@mantine/core'

// Tipos mock para demonstração
type Family = {
  id: string
  familyName: string
  familyPhone: string
}

export const dynamic = 'force-dynamic'

export default async function Family() {
  const familyResponse = await api.club.families.getLoggedInFamily()
  return (
    <Stack w={'100%'}>
      <FamilyCard initialData={familyResponse} />
      <InboundBlock initialData={familyResponse} />
    </Stack>
  )
}
