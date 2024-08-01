'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import Link from 'next/link'


export default function ParentsPage() {
  const t = useTranslations('parents_page')
  const router = useRouter()
  const { data: parents, isLoading } =
    api.club.parents.getParentsByLoggedInFamily.useQuery(undefined)

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link href="/club/family/parents/new" passHref>
          <Button>{t('add_parent_button')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {parents && parents.length > 0 ? (
          parents.map((parent) => (
            <Card key={parent.id} className="w-full">
              <CardHeader>
                <CardTitle>{`${parent.firstName} ${parent.lastName}`}</CardTitle>
                <CardDescription>
                  {t(`type.${parent.type}`)} - {t(`sex.${parent.sex}`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{parent.email}</p>
                <p>{parent.phone}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    router.push(`/club/family/parents/edit/${parent.id}`)
                  }
                  className="w-full"
                >
                  {t('edit_button')}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="w-full md:col-span-2">
            <CardHeader>
              <CardTitle>{t('no_parents.title')}</CardTitle>
              <CardDescription>{t('no_parents.description')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/club/family/parents/new" passHref className="w-full">
                <Button className="w-full">{t('add_parent_button')}</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
