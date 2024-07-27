'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/trpc/react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function InboundBlock({
  familyHasParents,
  familyHasChildren,
}: {
  familyHasParents: boolean
  familyHasChildren: boolean
}) {
  const t = useTranslations('family_page')
  const router = useRouter()

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-y-4">
          <Separator />

          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.key} className="flex items-center space-x-2">
                <Checkbox checked={task.disabled} disabled />
                <span
                  className={cn('text-md', {
                    'line-through': task.disabled,
                  })}
                >
                  {task.label}
                  {task.badge && (
                    <Badge className="ml-4 bg-orange-500 hover:bg-orange-600">
                      {task.badge}
                    </Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
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
      </CardContent>
    </Card>
  )
}
