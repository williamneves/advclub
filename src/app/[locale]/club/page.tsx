'use client'

import { api } from '@/trpc/react'

export default function ClubPage() {
  const test = api.hello.useQuery()
  return <div>{test.data}</div>
}
