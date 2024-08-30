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
  Avatar,
} from '@mantine/core'
import dayjs from 'dayjs'
import { IconPlus } from '@tabler/icons-react'

export default function Kids() {
  const t = useTranslations('kids_page')
  // const router = useRouter()
  const { data: kids, isLoading } = api.club.kids.getAllKids.useQuery(undefined)

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
      </Group>
      {!!kids?.length && (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {kids?.map((kid, key) => (
            <Card withBorder key={key}>
              <Card.Section className="border-0 border-b border-solid border-mtn-default-border">
                <Group wrap="nowrap">
                  <Avatar radius={0} size={80} src={kid.avatar} />
                  <Stack gap={0} className="w-full overflow-hidden" pr={'md'}>
                    <Text
                      fz={18}
                      fw={500}
                      className="overflow-hidden truncate text-ellipsis"
                    >
                      {kid.firstName} {kid.lastName}
                    </Text>
                    <Text
                      fz={14}
                      fw={400}
                      className="overflow-hidden truncate text-ellipsis"
                    >
                      {dayjs(kid.birthDate).format('DD/MM/YYYY')} (
                      {dayjs().diff(kid.birthDate, 'years')} anos)
                    </Text>
                    <Text
                      fz={14}
                      fw={400}
                      className="overflow-hidden truncate text-ellipsis"
                    >
                      {t('')}
                    </Text>
                  </Stack>
                </Group>
              </Card.Section>
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
