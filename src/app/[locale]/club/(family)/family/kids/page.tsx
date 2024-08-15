'use client'

import { useTranslations } from 'next-intl'
// import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import Link from 'next/link'
import {
  Button,
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Title,
  Text,
  // Avatar,
} from '@mantine/core'
// import { cn } from '@/lib/utils'
import Image from 'next/image'
import { formatPhoneNumber } from '@/utils/stringUtils'
import { IconEdit, IconPlus } from '@tabler/icons-react'

export default function KidsPage() {
  const t = useTranslations('kids_page')
  // const router = useRouter()
  const { data: kids, isLoading } =
    api.club.kids.getKidsByLoggedInFamily.useQuery(undefined)

  if (isLoading) {
    return (
      <Center w="100%" h="100%">
        <Loader />
      </Center>
    )
  }

  return (
    <Stack gap={'sm'} w={'100%'}>
      <Group justify="space-between" align="center">
        <Title order={3}>{t('title')}</Title>
        <Button
          component={Link}
          rightSection={<IconPlus size={18} />}
          href="/club/family/kids/new"
        >
          {t('add_kid_button')}
        </Button>
      </Group>
      {!!kids?.length && (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {kids?.map((kid) => (
            <Card withBorder key={kid.id} className="w-full">
              <Group wrap="nowrap">
                <div className="size-[160px] overflow-hidden rounded-md sm:size-[180px] md:size-[210px]">
                  <Image
                    src={kid.avatar ?? ''}
                    alt={kid.firstName ?? ''}
                    width={160}
                    height={160}
                    className="size-[160px] rounded-md object-cover transition-all hover:scale-105 sm:size-[180px] md:size-[210px]"
                  />
                </div>
                <Stack gap={6} h="100%" justify="space-between">
                  <Text className="truncate text-lg font-bold md:text-xl">{`${kid.firstName} ${kid.lastName}`}</Text>
                  <Stack gap={6}>
                    <Group>
                      <Text className="text-sm font-semibold sm:text-sm md:text-lg">
                        {t(`sex.${kid.sex}`)}
                      </Text>
                    </Group>

                    <Text className="text-sm sm:text-md md:text-lg">
                      {formatPhoneNumber(kid.phoneNumber ?? '')}
                    </Text>
                  </Stack>
                  <Button
                    component={Link}
                    rightSection={<IconEdit size={18} />}
                    href={`/club/family/kids/edit/${kid.id}`}
                  >
                    {t('edit_button')}
                  </Button>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
      {!kids?.length && (
        <Card withBorder>
          <Stack>
            <Title order={4}>{t('no_kids.title')}</Title>
            <Text>{t('no_kids.description')}</Text>
            <Button
              rightSection={<IconPlus size={18} />}
              component={Link}
              href="/club/family/kids/new"
            >
              {t('add_kid_button')}
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
