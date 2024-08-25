import { useAuth } from '@/app/_components/auth-context'
import { cn } from '@/lib/utils'
import {
  Avatar,
  Group,
  Menu,
  Skeleton,
  SkeletonProps,
  Stack,
  UnstyledButton,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { forwardRef } from 'react'
import Image from 'next/image'
import BRAZIL from '@/assets/images/brazil_flag.png'
import USA from '@/assets/images/usa_flag.png'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { IconCheck, IconLogout } from '@tabler/icons-react'

const languages = [
  { code: 'pt-BR', name: 'Português', flag: BRAZIL },
  { code: 'en', name: 'English', flag: USA },
] as const

export function UserButton() {
  const { user, logout } = useAuth()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  const handleChange = (value: string) => {
    router.push(pathname, { locale: value })
  }

  return (
    <Menu
      width={160}
      position="left-start"
      shadow="lg"
      withArrow
      arrowPosition="center"
      arrowSize={10}
    >
      <Menu.Target>
        {user ? (
          <Avatar
            src={
              user.user_metadata.avatar_url ??
              user.user_metadata.picture ??
              user.user_metadata.avatar
            }
            radius={'xl'}
            className={cn(
              'mr-2 size-9 cursor-pointer ring-2 ring-mtn-gray-5 ring-offset-2 transition-all hover:ring-offset-1',
            )}
          />
        ) : (
          <Skeleton
            visible={!user}
            className="size-9 ring-2 ring-mtn-primary-light ring-offset-2"
          />
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('language_chooser_label')}</Menu.Label>
        <Stack gap={4}>
          {languages.map((lang) => (
            <Menu.Item
              color={lang.code === 'en' ? 'red' : 'green'}
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              classNames={{
                item: cn({
                  'bg-[#4cad53]/10': lang.code === locale && locale === 'pt-BR',
                  'bg-[#b22335]/10': lang.code === locale && locale === 'en',
                }),
              }}
            >
              <Group align="center" gap={'8'}>
                <div
                  className={cn(
                    'ring-offset-background size-5 cursor-pointer overflow-hidden rounded-md ring-offset-2',
                    {
                      'ring-[#b22335]': lang.code === 'en',
                      'ring-[#4cad53]': lang.code === 'pt-BR',
                      'ring-2': lang.code === locale,
                    },
                  )}
                >
                  <Image
                    src={lang.flag}
                    priority
                    alt="flag"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Text size="sm" c={lang.code === 'en' ? 'red.9' : 'green.8'}>
                  {lang.name}
                </Text>
                {lang.code === locale && (
                  <ThemeIcon size={'xs'} variant="transparent">
                    <IconCheck
                      size={16}
                      className={cn({
                        'text-[#b22335]': lang.code === 'en',
                        'text-[#4cad53]': lang.code === 'pt-BR',
                      })}
                    />
                  </ThemeIcon>
                )}
              </Group>
            </Menu.Item>
          ))}
        </Stack>
        <Menu.Divider />
        <Menu.Item>{t('profile')}</Menu.Item>
        <Menu.Item
          onClick={logout}
          color={'orange'}
          rightSection={<IconLogout size={18} stroke={1.5} />}
        >
          {t('logout')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
