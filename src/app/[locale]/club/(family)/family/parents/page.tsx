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
} from '@mantine/core'

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
        <Button component={Link} href="/club/family/parents/new">
          {t('add_parent_button')}
        </Button>
      </Group>
      {!!parents?.length && (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {parents?.map((parent) => (
            <Card withBorder key={parent.id} className="w-full">
              <Stack>
                <Title
                  order={4}
                >{`${parent.firstName} ${parent.lastName}`}</Title>
                <Group>
                  <Text>
                    {t(`type.${parent.type}`)} - {t(`sex.${parent.sex}`)}
                  </Text>
                </Group>
                <Text>{parent.email}</Text>
                <Text>{parent.phone}</Text>
                <Button
                  component={Link}
                  href={`/club/family/parents/edit/${parent.id}`}
                >
                  {t('edit_button')}
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
      {!parents?.length && (
        <Card withBorder>
          <Stack>
            <Title order={4}>{t('no_parents.title')}</Title>
            <Text>{t('no_parents.description')}</Text>
            <Button component={Link} href="/club/family/parents/new">
              {t('add_parent_button')}
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
