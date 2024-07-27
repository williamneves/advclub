import { api } from "@/trpc/server"

export default async function Layout({ children }: { children: React.ReactNode }) {
  void await api.club.families.getLoggedInFamily.prefetch()
  return <>{children}</>
}