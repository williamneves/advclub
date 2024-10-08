import React, { Fragment, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { api, type RouterOutputs } from '@/trpc/react'
import { ActionIcon, Flex, NavLink, Stack, Text } from '@mantine/core'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { MdFamilyRestroom, MdChildCare } from 'react-icons/md'
import { TbFriends } from 'react-icons/tb'
import Image from 'next/image'
import LOGO from '@/assets/images/LOGO-BLUE-CROSS.png'
import { IconFiles, IconX } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'
export function NavBlock({
  initialData,
  opened,
  onClose,
}: {
  isMobile?: boolean
  initialData: RouterOutputs['club']['families']['getLoggedInFamily']
  opened: boolean
  onClose: () => void
}) {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const [family] = api.club.families.getLoggedInFamily.useSuspenseQuery(
    undefined,
    {
      retry: 0,
      initialData,
    },
  )
  const familyCreated = !!family

  const isMobile = useMediaQuery('(max-width: 991px)')

  const handleLinkClick = (event: React.MouseEvent) => {
    // Call onClose when a link is clicked
    if (!isMobile) return
    onClose()
  }

  useEffect(() => {
    // if click outside at mobile, close it
    const handleClickOutside = (event: MouseEvent) => {
      // return if is not mobile
      if (!isMobile) return

      if (opened && !(event.target as HTMLElement)?.closest('#side-nav')) {
        onClose()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [opened, onClose, isMobile])

  return (
    <Stack>
      <Flex h={60} className="w-full items-center justify-between gap-2">
        <Flex align="center" gap={4}>
          <Image
            src={LOGO}
            priority
            alt="Brazilian Pioneers Kids Club"
            className="size-10 lg:size-12"
          />
          <Text component="span" fz={'lg'} fw={'bold'} className="no-underline">
            BPKids.club
          </Text>
        </Flex>
        {opened && (
          <ActionIcon variant="subtle" color="dark" onClick={onClose}>
            <IconX size={20} stroke={1.5} />
          </ActionIcon>
        )}
      </Flex>
      <Stack gap={6}>
        <NavLink
          component={Link}
          href="/club/family"
          leftSection={<MdFamilyRestroom className="size-5" />}
          label={t('family')}
          data-active={isActive(pathname, '/club/family')}
          className={cn('rounded-md data-[active]:font-semibold')}
          onClick={handleLinkClick}
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
              onClick={handleLinkClick}
            />
            <NavLink
              component={Link}
              href="/club/family/kids"
              leftSection={<MdChildCare className="size-5" />}
              label={t('kids')}
              data-active={isActive(pathname, '/club/family/kids')}
              className={cn('rounded-md data-[active]:font-semibold')}
              onClick={handleLinkClick}
            />
            <NavLink
              component={Link}
              href="/club/forms"
              leftSection={<IconFiles className="size-5" />}
              label={t('forms')}
              data-active={isActive(pathname, '/club/family/forms')}
              className={cn('rounded-md data-[active]:font-semibold')}
              onClick={handleLinkClick}
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
