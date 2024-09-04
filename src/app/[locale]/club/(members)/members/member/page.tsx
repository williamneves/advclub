'use client'

import { useTranslations } from 'next-intl'
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
import { formatPhoneNumber } from '@/utils/stringUtils'
import { IconEdit, IconPlus } from '@tabler/icons-react'

export default function MembersPage() {
  const t = useTranslations('members_page')

  const { data: members, isLoading: isLoadingMembers } =
    api.club.members.getAllMembers.useQuery(undefined)

  if (isLoadingMembers) {
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
          href="/club/members/member/new"
        >
          {t('add_member_button')}
        </Button>
      </Group>
      {!!members?.length && (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {members?.map((member) => (
            <Card withBorder key={member.id} className="w-full">
              <Group wrap="nowrap">
                <Stack gap={6} h="100%" justify="space-between">
                  <Text className="truncate text-lg font-bold md:text-xl">{`${member.firstName} ${member.lastName}`}</Text>
                  <Stack gap={6}>
                    <Group>
                      <Text className="text-sm font-semibold sm:text-sm md:text-lg">
                        {t(`sex.${member.sex}`)}
                      </Text>
                    </Group>

                    <Text className="text-sm sm:text-md md:text-lg">
                      {formatPhoneNumber(member.phone ?? '')}
                    </Text>
                  </Stack>
                  <Button
                    component={Link}
                    rightSection={<IconEdit size={18} />}
                    href={`/club/members/member/edit/${member.id}`}
                  >
                    {t('edit_button')}
                  </Button>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
      {!members?.length && (
        <Card withBorder>
          <Stack>
            <Title order={4}>{t('no_members.title')}</Title>
            <Text>{t('no_members.description')}</Text>
            <Button
              rightSection={<IconPlus size={18} />}
              component={Link}
              href="/club/members/member/new"
            >
              {t('add_member_button')}
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
