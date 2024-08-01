
import { MantineShell } from './shell'

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return <MantineShell>{children}</MantineShell>
}
