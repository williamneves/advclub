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
import { Center, Loader } from '@mantine/core'


export default function KidsPage() {
  const t = useTranslations('kids_page')
  const router = useRouter()
  const { data: kids, isLoading } =
    api.club.kids.getKidsByLoggedInFamily.useQuery(undefined)

  if (isLoading) {
    return (
      <Center className="flex-1">
        <Loader />
      </Center>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link href="/club/family/kids/new" passHref>
          <Button>{t('add_kid_button')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {kids && kids.length > 0 ? (
          kids.map((kid) => (
            <Card key={kid.id} className="w-full">
              <CardHeader>
                <CardTitle>{`${kid.firstName} ${kid.lastName}`}</CardTitle>
                <CardDescription>
                  {kid.alias && `${t('alias')}: ${kid.alias} - `}
                  {t(`sex.${kid.sex}`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{kid.phoneNumber}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    router.push(`/club/family/kids/edit/${kid.id}`)
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
              <CardTitle>{t('no_kids.title')}</CardTitle>
              <CardDescription>{t('no_kids.description')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/club/family/kids/new" passHref className="w-full">
                <Button className="w-full">{t('add_kid_button')}</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
