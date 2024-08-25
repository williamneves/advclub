import { api, HydrateClient } from '@/trpc/server'
import FamilyContext from './family/family-context'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  void (await api.club.families.getLoggedInFamily.prefetch())
  void (await api.club.kids.getKidsByLoggedInFamily.prefetch())
  void (await api.club.parents.getParentsByLoggedInFamily.prefetch())

  return (
    <HydrateClient>
      <FamilyContext>{children}</FamilyContext>
    </HydrateClient>
  )
}
