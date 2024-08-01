'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { cn } from '@/lib/utils'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  List,
  Text,
  Title,
} from '@mantine/core'

export function InboundBlock() {
  const t = useTranslations('family_page')
  const router = useRouter()

  const [family] = api.club.families.getLoggedInFamily.useSuspenseQuery()
  const familyHasParents = !!family[0]?.parents?.length
  const familyHasChildren = !!family[0]?.kids?.length

  const tasks = [
    {
      key: 'hasParents',
      label: t('tasks.add_parents'),
      link: '/club/family/parents',
      disabled: familyHasParents,
    },
    {
      key: 'hasChildren',
      label: t('tasks.add_children'),
      link: '/club/family/children',
      disabled: familyHasChildren,
    },
    {
      key: 'canRegister',
      label: t('tasks.fill_registration'),
      link: '/club/family/registration',
      badge: t('tasks.coming_soon_badge'),
    },
  ]

  return (
    <Card withBorder>
      <Title>{t('title')}</Title>
      <Text>{t('description')}</Text>
      <div className="flex flex-col gap-y-4">
        <Divider />

        <List>
          {tasks.map((task) => (
            <List.Item key={task.key} icon={<Checkbox checked={task.disabled} disabled />}>
                <span
                  className={cn('text-md', {
                    'line-through': task.disabled,
                  })}
                >
                  <Group align="center">
                    {task.label}
                    {task.badge && <Badge color="orange">{task.badge}</Badge>}
                  </Group>
                </span>
            </List.Item>
          ))}
        </List>
        <Divider />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Button
            onClick={() => router.push('/club/family/parents')}
            variant={familyHasParents ? 'outline' : 'default'}
          >
            {t('add_parents')}
          </Button>
          <Button
            onClick={() => router.push('/club/family/kids')}
            variant={familyHasChildren ? 'outline' : 'default'}
          >
            {t('add_children')}
          </Button>
          <Button
            className={cn({
              'cursor-not-allowed': !familyHasChildren || !familyHasParents,
            })}
            disabled={!familyHasChildren || !familyHasParents}
            onClick={() => router.push('/club/family/forms')}
          >
            {t('register_button')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
