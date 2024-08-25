import { type Metadata } from 'next'

import { TRPCReactProvider } from '@/trpc/react'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Analytics } from '@vercel/analytics/react'
import { cloakSSROnlySecret } from 'ssr-only-secrets'

import { BaseThemeProvider } from '@/theme/provider'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { AuthProvider } from '../_components/auth-context'
export const metadata: Metadata = {
  title: 'BPKids.Club',
  description: 'Brazillian Pioneers Kids Club',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { locale: string } }>) {
  const messages = await getMessages()
  const cookie = new Headers(headers()).get('cookie')
  const encryptedCookie = await cloakSSROnlySecret(
    cookie ?? '',
    'SECRET_CLIENT_COOKIE_VAR',
  )
  const supabase = createClient()
  const user = await supabase.auth.getUser()
  return (
    <NextIntlClientProvider messages={messages}>
      <html lang={params.locale}>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        </head>
        <body suppressContentEditableWarning suppressHydrationWarning>
          <BaseThemeProvider>
            <TRPCReactProvider ssrOnlySecret={encryptedCookie}>
              <AuthProvider prefetchedUser={user.data.user}>
                {children}
              </AuthProvider>
            </TRPCReactProvider>
          </BaseThemeProvider>
        </body>
      </html>
      <Analytics />
    </NextIntlClientProvider>
  )
}
