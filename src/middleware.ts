/**
 * Middleware configuration for Next.js application
 * Handles Clerk authentication and next-intl internationalization
 *
 * References:
 * - next-intl middleware: https://next-intl-docs.vercel.app/docs/routing/middleware
 * - Clerk + next-intl integration: https://next-intl-docs.vercel.app/docs/routing/middleware#example-integrating-with-clerk
 * - Clerk upgrade guide: https://clerk.com/docs/upgrade-guides/core-2/nextjs
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { localePrefix, locales } from './navigation'

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  localePrefix,
  defaultLocale: 'pt-BR'
})

// Define route matchers
const isProtectedRoute = createRouteMatcher(['/(:locale)/club(.*)'])
const isApiRoute = createRouteMatcher(['/api(.*)'])

// Main middleware function
export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl

  // Handle API routes
  if (isApiRoute(req)) {
    // Apply Clerk authentication to protected API routes
    if (isProtectedRoute(req)) {
      auth().protect()
    }
    return // Skip internationalization for API routes
  }

  // Exclude Next.js and Vercel internal routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/_vercel')) {
    return
  }

  // Apply authentication to protected routes
  if (isProtectedRoute(req)) {
    auth().protect()
  }

  // Apply internationalization to non-API routes
  return intlMiddleware(req)
})

// Middleware matcher configuration
export const config = {
  matcher: [
    // Match all pathnames except for:
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - all root files inside /public (e.g. /favicon.ico)
    '/((?!_next|_vercel|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
}