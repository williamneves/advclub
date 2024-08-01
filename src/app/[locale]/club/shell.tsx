'use client'

import { AppShell, Burger, Flex, Group, Skeleton, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Image from 'next/image'
import LOGO from '@/assets/images/LOGO-BLUE-CROSS.png'
import { LanguageSelector } from '@/components/language-selector'
import { UserButton } from '@clerk/nextjs'



export function MantineShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      layout='alt'
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
          <Group className="ml-auto" align='center'>
              <LanguageSelector />
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      'h-9 w-9 rounded-md ring-2 ring-primary/50 hover:ring-primary/70 transition-all duration-200 ease-in-out ring-offset-2 ring-offset-background hover:ring-offset-0',
                  },
                }}
              />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" pt={0}>
        <NavBlock />
      </AppShell.Navbar>
      <AppShell.Main bg={'gray.0'}>{children}</AppShell.Main>
    </AppShell>
  )
}

import React, { Fragment } from 'react'
import { LayoutDashboard, Contact, Baby, FileStack } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { NavLink } from '@mantine/core'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { MdFamilyRestroom, MdChildCare } from 'react-icons/md'
import { TbFriends } from 'react-icons/tb'
function NavBlock({ isMobile }: { isMobile?: boolean }) {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const family = api.club.families.getLoggedInFamily.useQuery(undefined, {
    retry: 0,
  })
  const familyCreated = !family.isLoading && !!family.data

  return (
    <Stack>
      <Flex h={60} className="w-full items-center justify-center gap-2">
        <Image
          src={LOGO}
          priority
          alt="BT Adventurer Club"
          className="size-10 lg:size-12"
        />
        <Text component="span" fz={'lg'} fw={'bold'} className="no-underline">
          BT Adventurer&apos;s
        </Text>
      </Flex>
      <Stack gap={6}>
        <NavLink
          component={Link}
          href="/club/family"
          leftSection={<MdFamilyRestroom className="size-5" />}
          label={t('family')}
          data-active={isActive(pathname, '/club/family')}
          className={cn('rounded-md data-[active]:font-semibold')}
        />
        {familyCreated && (
          <>
            <NavLink
              component={Link}
              href="/club/family/parents"
              leftSection={<TbFriends className="size-5" />}
              label={t('parents')}
              data-active={isActive(pathname, '/club/family/parents')}
              className={cn('rounded-md data-[active]:font-semibold')}
            />
            <NavLink
              component={Link}
              href="/club/family/kids"
              leftSection={<MdChildCare className="size-5" />}
              label={t('kids')}
              data-active={isActive(pathname, '/club/family/kids')}
              className={cn('rounded-md data-[active]:font-semibold')}
            />
            <NavLink
              component={Link}
              href="/club/family/forms"
              leftSection={<FileStack className="size-5" />}
              label={t('forms')}
              data-active={isActive(pathname, '/club/family/forms')}
              className={cn('rounded-md data-[active]:font-semibold')}
            />
          </>
        )}
      </Stack>
    </Stack>
  )
}

function isActive(pathname: string, href: string) {
  return (
    pathname.endsWith(href) ||
    pathname === href ||
    pathname.match(new RegExp(`^/(en|pt-BR)?${href}$`))
  )
}
