import { api, HydrateClient } from '@/trpc/server'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  void (await api.club.families.getLoggedInFamily.prefetch())
  void (await api.club.kids.getKidsByLoggedInFamily.prefetch())
  void (await api.club.parents.getParentsByLoggedInFamily.prefetch())

  return <HydrateClient>{children}</HydrateClient>
}
