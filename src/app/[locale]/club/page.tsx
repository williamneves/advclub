import { api } from '@/trpc/server'

export default async function ClubPage() {
  const test = await api.hello()
  return <div>{test}</div>
}
