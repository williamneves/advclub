import { env } from '@/env'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { localePrefix, locales } from '@/navigation'

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  localePrefix,
  defaultLocale: 'pt-BR',
  localeDetection: false,
})

export async function updateSession(request: NextRequest) {
  // let supabaseResponse = intlMiddleware(request)
  let supabaseResponse =
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/auth')
      ? NextResponse.next({ request })
      : intlMiddleware(request)

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user and the route match with /club/
  if (!user && request.nextUrl.pathname.includes('/club')) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // if user but on auth routes (login, register, forgot-password)
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register') ||
      request.nextUrl.pathname.startsWith('/forgot-password'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/club'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
