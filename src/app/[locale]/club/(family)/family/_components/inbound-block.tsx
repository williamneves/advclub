'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { api, type RouterOutputs } from '@/trpc/react'
import { cn } from '@/lib/utils'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  IconChevronRight,
  IconCircle,
  IconCircleChevronRight,
  IconPoint,
  IconSquareChevronRight,
} from '@tabler/icons-react'
import Link from 'next/link'

export function InboundBlock({
  initialData,
}: {
  initialData: RouterOutputs['club']['families']['getLoggedInFamily']
}) {
  const t = useTranslations('family_page')
  const router = useRouter()

  const [family] = api.club.families.getLoggedInFamily.useSuspenseQuery(
    undefined,
    {
      initialData,
    },
  )
  const parentsLength = family?.parents?.length
  const kidsLength = family?.kids?.length
  const familyHasParents = !!parentsLength
  const familyHasChildren = !!kidsLength

  const initalTasks = [
    {
      key: 'hasParents',
      label: t('tasks.add_parents'),
      link: '/club/family/parents',
      disabled: familyHasParents,
      kid: null,
      subTasks: [],
    },
    {
      key: 'hasChildren',
      label: t('tasks.add_children'),
      link: '/club/family/kids',
      disabled: familyHasChildren,
      kid: null,
      subTasks: [],
    },
  ]

  const kidsTasks =
    family?.kids?.map((kid) => ({
      key: `kidsForms-${kid.id}`,
      label: t('tasks.kids_forms.label', {
        firstName: kid.firstName,
        lastName: kid.lastName,
      }),
      link: '/club/forms',
      disabled: kid.forms.length === 0,
      kid: kid,
      subTasks: [
        {
          key: 'membership_application',
          label: t('tasks.forms.membership_application'),
          completed: kid.forms.find(
            (form) => form.slug.replace('-', '_') === 'membership_application',
          ),
        },
        {
          key: 'medical_consent',
          label: t('tasks.forms.medical_consent'),
          completed: kid.forms.find(
            (form) => form.slug.replace('-', '_') === 'medical_consent',
          ),
        },
        {
          key: 'media_consent',
          label: t('tasks.forms.media_consent'),
          completed: kid.forms.find(
            (form) => form.slug.replace('-', '_') === 'media_consent',
          ),
        },
        {
          key: 'code_conduct',
          label: t('tasks.forms.code_conduct'),
          completed: kid.forms.find(
            (form) => form.slug.replace('-', '_') === 'code_conduct',
          ),
        },
      ],
    })) ?? []

  const tasks = [...initalTasks, ...kidsTasks]

  return (
    <Card withBorder>
      <Title order={2}>{t('title')}</Title>
      <Text fz={'md'} c={'dimmed'}>
        {t('description')}
      </Text>
      <div className="flex flex-col gap-y-4">
        <Divider />
        <Stack gap={8}>
          <Text fw={700}>{t('list')}:</Text>
          <List>
            {tasks.map((task) =>
              task.subTasks.length > 0 ? (
                <Stack key={task.key} gap={0}>
                  <List.Item
                    icon={
                      <ThemeIcon size={20} variant="outline">
                        <IconChevronRight size={16} />
                      </ThemeIcon>
                    }
                  >
                    <span
                      className={cn('text-md', {
                        'line-through': task.disabled,
                      })}
                    >
                      <Group align="center">{task.label}</Group>
                    </span>
                  </List.Item>
                  <List withPadding>
                    {task.subTasks.map((subTask) => (
                      <List.Item
                        key={subTask.key}
                        onClick={() => {
                          router.push(task.link)
                        }}
                        className="cursor-pointer"
                        icon={
                          <Checkbox
                            defaultChecked={!!subTask.completed}
                            readOnly
                            color="teal"
                          />
                        }
                      >
                        {subTask.label}
                      </List.Item>
                    ))}
                  </List>
                </Stack>
              ) : (
                <List.Item
                  key={task.key}
                  onClick={() => {
                    router.push(task.link)
                  }}
                  className="cursor-pointer"
                  icon={
                    <Checkbox
                      checked={!!task.disabled}
                      onChange={() => ({})}
                      readOnly
                    />
                  }
                >
                  <span
                    className={cn('text-md', {
                      'text-mtn-primary-filled': task.disabled,
                    })}
                  >
                    <Group align="center">
                      {task.label}
                      {task.key === 'hasParents' && (
                        <Badge
                          color="blue"
                          variant={parentsLength ? 'outline' : 'filled'}
                        >
                          {parentsLength}
                        </Badge>
                      )}
                      {task.key === 'hasChildren' && (
                        <Badge
                          color="blue"
                          variant={kidsLength ? 'outline' : 'filled'}
                        >
                          {kidsLength}
                        </Badge>
                      )}
                    </Group>
                  </span>
                </List.Item>
              ),
            )}
          </List>
        </Stack>
        <Divider />
        <Stack gap={8}>
          <Text fw={700}>{t('actions')}:</Text>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={'md'}>
            <Button
              component={Link}
              href="/club/family/parents"
              variant={familyHasParents ? 'outline' : 'filled'}
            >
              {t('add_parents')}
            </Button>
            <Button
              component={Link}
              href="/club/family/kids"
              variant={familyHasChildren ? 'outline' : 'filled'}
            >
              {t('add_children')}
            </Button>
            <Button
              className={cn({
                'flex-grow cursor-not-allowed':
                  !familyHasChildren || !familyHasParents,
              })}
              disabled={!familyHasChildren || !familyHasParents}
              component={Link}
              href="/club/forms"
            >
              {t('register_button')}
            </Button>
          </Flex>
        </Stack>
      </div>
    </Card>
  )
}
