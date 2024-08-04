
import { api } from '@/trpc/server'
import { MantineShell } from './_components/shell/club-shell'

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const familyResponse = await api.club.families.getLoggedInFamily()

  return <MantineShell initialData={familyResponse}>{children}</MantineShell>
}
