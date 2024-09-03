'use client'

import {
  Card,
  Text,
  Title,
  Stack,
  SimpleGrid,
  Group,
  SegmentedControl,
  Divider,
  ThemeIcon,
  Avatar,
  Flex,
  Table,
  ActionIcon,
} from '@mantine/core'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { IconEye, IconListDetails } from '@tabler/icons-react'
import { api, type RouterOutputs } from '@/trpc/react'
import { useState } from 'react'
import dayjs from 'dayjs'
import { FORM_TYPES_LABELS } from '../../../(family)/forms/_components/consts'

export default function Applications() {
  const t = useTranslations('forms_page')
  const [type, setType] = useState<'type' | 'kid'>('type')

  return (
    <Stack>
      <Stack gap={0}></Stack>
      <Stack gap={6}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          gap={'md'}
        >
          <Group gap={8} wrap="nowrap">
            <ThemeIcon variant="light" size={'lg'}>
              <IconListDetails size={22} />
            </ThemeIcon>
            <Title order={3} className="overflow-hidden truncate text-ellipsis">
              {t('application')}
            </Title>
          </Group>
          <Group>
            <Text fz="sm">Filtrar por:</Text>
            <SegmentedControl
              flex={1}
              radius="md"
              value={type}
              onChange={(value) => setType(value as 'type' | 'kid')}
              data={[
                {
                  label: 'Tipo',
                  value: 'type',
                },
                {
                  label: 'Criança',
                  value: 'kid',
                },
              ]}
            />
          </Group>
        </Flex>
        <Divider />
      </Stack>
      {type === 'type' ? <FormsByType /> : <FormsByKid />}
    </Stack>
  )
}

function FormsByKid() {
  const [forms] = api.club.forms.getAllForms.useSuspenseQuery()

  const formsByKid = forms.reduce(
    (acc: Record<string, (typeof forms)[number][]>, form) => {
      const { kidId } = form
      if (!acc[kidId]) {
        acc[kidId] = []
      }
      acc[kidId].push(form)
      return acc
    },
    {},
  )

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      {Object.entries(formsByKid).map(([kidId, forms]) => {
        const kid = forms[0]?.kid
        if (!kid) return null

        return (
          <Card withBorder key={kidId}>
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
                </Stack>
              </Group>
            </Card.Section>
            <Card.Section className="overflow-x-scroll">
              <FormsList forms={forms} />
            </Card.Section>
          </Card>
        )
      })}
    </SimpleGrid>
  )
}

function FormsList({
  forms,
  withKidName = false,
}: {
  forms: RouterOutputs['club']['forms']['getAllForms'][number][]
  withKidName?: boolean
}) {
  const rows = forms.map((form) => (
    <Table.Tr key={form.id}>
      {!withKidName && (
        <Table.Td>
          <Text className="line-clamp-2" fz={14}>
            {form.title}
          </Text>
        </Table.Td>
      )}
      {withKidName && (
        <Table.Td>
          <Group wrap="nowrap">
            {form.kid?.avatar && (
              <Avatar radius={'md'} size={28} src={form.kid.avatar} />
            )}
            <Text className="line-clamp-1" fz={14}>
              {form.kid?.firstName} {form.kid?.lastName}
            </Text>
          </Group>
        </Table.Td>
      )}
      {/* <Table.Td>{dayjs(form.createdAt).format('DD/MM/YYYY')}</Table.Td> */}
      <Table.Td>{form.status}</Table.Td>
      <Table.Td>
        <ActionIcon
          variant="light"
          size={'md'}
          component={Link}
          href={`/club/forms/${form.slug}/review/${form.id}`}
        >
          <IconEye size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Table striped horizontalSpacing={'md'} verticalSpacing={'xs'}>
      <Table.Thead>
        <Table.Tr>
          {!withKidName && <Table.Th>Título</Table.Th>}
          {withKidName && <Table.Th>Criança</Table.Th>}
          {/* <Table.Th>Criado em</Table.Th> */}
          <Table.Th>Status</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}

function FormsByType() {
  const [forms] = api.club.forms.getAllForms.useSuspenseQuery()

  const formsByType = forms.reduce(
    (acc: Record<string, (typeof forms)[number][]>, form) => {
      const { slug } = form
      if (!acc[slug]) {
        acc[slug] = []
      }
      acc[slug].push(form)
      return acc
    },
    {},
  )

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      {Object.entries(formsByType).map(([slug, forms]) => {
        return (
          <Card withBorder key={slug}>
            <Card.Section className="flex items-center justify-center border-0 border-b border-solid border-mtn-default-border py-4">
              <Text fz={18} fw={500}>
                {FORM_TYPES_LABELS[slug as keyof typeof FORM_TYPES_LABELS]}
              </Text>
            </Card.Section>
            <Card.Section className="overflow-x-scroll">
              <FormsList forms={forms} withKidName={true} />
            </Card.Section>
          </Card>
        )
      })}
    </SimpleGrid>
  )
}
