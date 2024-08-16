'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  List,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import LOGO from '@/assets/images/LOGO-BLUE-CROSS.png'
import Image from 'next/image'

export default function Home() {
  const t = useTranslations('Home')
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white p-4">
      <Card shadow="lg" withBorder p={'lg'} maw={460} miw={320}>
        <Stack gap={'xs'}>
          <Flex className="w-full items-center justify-center gap-2">
            <Image
              src={LOGO}
              priority
              alt="BT Adventurer Club"
              className="lg:size-13 size-11"
            />
            <Text
              component="span"
              fz={'lg'}
              fw={'bold'}
              className="no-underline"
            >
              BT Adventurer&apos;s
            </Text>
          </Flex>
          <Divider />
          <Stack className="text-center" gap={6}>
            <Title
              order={2}
              className="mb-2 text-2xl font-semibold text-blue-700"
            >
              {t('welcome')}
            </Title>
            <Text className="mb-4 text-gray-600">{t('description')}</Text>
            <Text className="mb-2 text-gray-700">{t('currentFeatures')}</Text>
            <List className="mb-4 text-gray-600">
              <List.Item>{t('registerFamily')}</List.Item>
              <List.Item>{t('moreComingSoon')}</List.Item>
            </List>
            <Text className="text-sm italic text-gray-500">
              {t('stayTuned')}
            </Text>
          </Stack>
          {/* <Group grow py={'xs'}>
            {isSignedIn ? (
              <Button component={Link} href="/club/family" size='md' className="w-full">
                {t('goToClubButton')}
              </Button>
            ) : (
              <div className="w-full space-y-2">
                <Button component={Link} href="/register" className="w-full">
                  {t('registerButton')}
                </Button>
                <Button component={Link} href="/login" variant="outline" className="w-full">
                  {t('loginButton')}
                </Button>
              </div>
            )}
          </Group> */}
        </Stack>
      </Card>
    </div>
  )
}
