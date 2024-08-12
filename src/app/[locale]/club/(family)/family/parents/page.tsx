'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
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
  Avatar,
} from '@mantine/core'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { formatPhoneNumber } from '@/utils/stringUtils'
import { IconEdit, IconPlus } from '@tabler/icons-react'

export default function ParentsPage() {
  const t = useTranslations('parents_page')
  const router = useRouter()
  const { data: parents, isLoading } =
    api.club.parents.getParentsByLoggedInFamily.useQuery(undefined)

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
          href="/club/family/parents/new"
        >
          {t('add_parent_button')}
        </Button>
      </Group>
      {!!parents?.length && (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {parents?.map((parent) => (
            <Card withBorder key={parent.id} className="w-full">
              <Group wrap="nowrap">
                <div className="size-[160px] overflow-hidden rounded-md sm:size-[180px] md:size-[210px]">
                  <Image
                    src={parent.avatar ?? ''}
                    alt={parent.firstName ?? ''}
                    width={160}
                    height={160}
                    className="size-[160px] rounded-md object-cover transition-all hover:scale-105 sm:size-[180px] md:size-[210px]"
                  />
                </div>
                <Stack gap={6} h="100%" justify="space-between">
                  <Text className="truncate text-lg font-bold md:text-xl">{`${parent.firstName} ${parent.lastName}`}</Text>
                  <Stack gap={6}>
                    <Group>
                      <Text className="text-sm font-semibold sm:text-sm md:text-lg">
                        {t(`type.${parent.type}`)} - {t(`sex.${parent.sex}`)}
                      </Text>
                    </Group>
                    <Text className="text-sm sm:text-md md:text-lg">
                      {parent.email}
                    </Text>
                    <Text className="text-sm sm:text-md md:text-lg">
                      {formatPhoneNumber(parent.phone ?? '')}
                    </Text>
                  </Stack>
                  <Button
                    component={Link}
                    rightSection={<IconEdit size={18} />}
                    href={`/club/family/parents/edit/${parent.id}`}
                  >
                    {t('edit_button')}
                  </Button>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
      {!parents?.length && (
        <Card withBorder>
          <Stack>
            <Title order={4}>{t('no_parents.title')}</Title>
            <Text>{t('no_parents.description')}</Text>
            <Button
              rightSection={<IconPlus size={18} />}
              component={Link}
              href="/club/family/parents/new"
            >
              {t('add_parent_button')}
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
