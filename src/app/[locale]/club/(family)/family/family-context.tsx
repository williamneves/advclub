'use client'

import { api } from '@/trpc/react'
import { Center, Loader } from '@mantine/core'
import { Fragment, Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function FamilyContext({
  children,
}: {
  children: React.ReactNode
}) {
  const family = api.club.families.getLoggedInFamily.useQuery()
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!family.data && pathname !== '/club/family/new') {
      router.push('/club/family/new')
    } else {
      setLoading(false)
    }
  }, [family, pathname])

  if (loading) {
    return (
      <Center className="flex-grow">
        <Loader type="bars" />
      </Center>
    )
  }

  return <Fragment>{children}</Fragment>
}
