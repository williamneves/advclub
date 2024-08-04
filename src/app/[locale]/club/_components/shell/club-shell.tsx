'use client'

import { AppShell, Burger, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import type { RouterOutputs } from '@/trpc/react'
import { NavBlock } from './nav-block'
import { UserButton } from './user-button'

export function MantineShell({
  initialData,
  children,
}: {
  initialData: RouterOutputs['club']['families']['getLoggedInFamily']
  children: React.ReactNode
}) {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
          </Group>
          <Group className="ml-auto" align="center">
            <UserButton />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" pt={0}>
        <NavBlock initialData={initialData} />
      </AppShell.Navbar>
      {/* <AppShell.Main bg={'gray.0'} className="flex">
        <div className="flex-1">{children}</div>
      </AppShell.Main> */}
      <AppShell.Main bg={'gray.0'} className="flex flex-col">
        <div className="flex-grow flex flex-col w-full">{children}</div>
      </AppShell.Main>
    </AppShell>
  )
}
