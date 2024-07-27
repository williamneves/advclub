import { api } from '@/trpc/server'
import { Shell } from './shell'

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {
    locale: string
  }
}) {
  const family = await api.club.families.getLoggedInFamily()
  const familyCreated = !!family
  return (
    <Shell>
      {children}
    </Shell>
  )
}
