'use client'

import { AppShell, Burger, Group, LoadingOverlay, Overlay } from '@mantine/core'
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

  const breakpoint = 'md'

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint, collapsed: { mobile: !opened } }}
      padding={{ base: 'xs', sm: 'sm', md: 'md' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom={breakpoint}
              size={breakpoint}
            />
          </Group>
          <Group className="ml-auto" align="center">
            <UserButton />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" pt={0} maw={300} zIndex={200} id="side-nav">
        <NavBlock opened={opened} onClose={toggle} initialData={initialData} />
      </AppShell.Navbar>
      <AppShell.Main bg={'gray.0'} className="relative flex flex-col">
        {opened && <Overlay blur={2} />}
        <div className="flex w-full flex-grow flex-col">{children}</div>
      </AppShell.Main>
    </AppShell>
  )
}
