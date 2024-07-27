import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, localePrefix } from './navigation'
const intlMiddleware = createMiddleware({
  locales,
  localePrefix: 'as-needed',
  defaultLocale: 'pt-BR',
  localeDetection: false,
})

import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  beforeAuth: (req) => {
    // Execute next-intl middleware before Clerk's auth middleware
    return intlMiddleware(req)
  },

  // Ensure that locale specific sign-in pages are public
  publicRoutes: ['((?!^/club).*)'],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}