import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, localePrefix } from "./navigation";
const intlMiddleware = createMiddleware({
  locales,
  localePrefix: "as-needed",
  defaultLocale: "pt-BR",
  localeDetection: false,
});

import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  beforeAuth: (req) => {
    // Execute next-intl middleware before Clerk's auth middleware
    return intlMiddleware(req)
  },

  // Ensure that locale specific sign-in pages are public
  publicRoutes: (req) => {
    const url = new URL(req.url)
    return !url.pathname.match(/^\/(pt-BR|en)\/club/)
  },
})

export const config = {
  matcher: [
    // Match all paths
    '/',
    // Match all paths starting with /pt-BR or /en
    '/(pt-BR|en)/:path*',
    // Match API and trpc routes
    '/(api|trpc)(.*)',
    // Match all other routes, but exclude static files and Next.js internals
    '/((?!api|trpc|_next/static|_next/image|favicon.ico).*)',
  ],
}

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - api (API routes)
//      * Feel free to modify this pattern to include more paths.
//      */
//     "/(pt-BR|en)/:path*",
//     "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };
