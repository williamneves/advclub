'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Logo } from '@/components/logo'

export default function Home() {
  const t = useTranslations('Home')
  const { isSignedIn } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex items-center justify-center pb-2">
          <Logo  />
        </CardHeader>
        <CardContent className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-blue-700">
            {t('welcome')}
          </h1>
          <p className="mb-4 text-gray-600">{t('description')}</p>
          <p className="mb-2 text-gray-700">{t('currentFeatures')}</p>
          <ul className="mb-4 text-gray-600">
            <li>{t('registerFamily')}</li>
            <li>{t('moreComingSoon')}</li>
          </ul>
          <p className="text-sm italic text-gray-500">{t('stayTuned')}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          {isSignedIn ? (
            <Button asChild className="w-full">
              <Link href="/club/family">{t('goToClubButton')}</Link>
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Button asChild className="w-full">
                <Link href="/register">{t('registerButton')}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">{t('loginButton')}</Link>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
