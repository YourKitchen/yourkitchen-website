import NextAuth from 'next-auth'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, type NextResponse } from 'next/server'
import authConfig from '#misc/auth.config'

const { auth: authMiddleware } = NextAuth(authConfig)

interface AppRouteHandlerFnContext {
  params?: Record<string, string | string[]>
}

const i18nMiddleware = createMiddleware({
  locales: ['en', 'da', 'es', 'de'],
  defaultLocale: 'en',
})

const setRequestHeaders = (request: NextRequest) => {
  const url = new URL(request.url)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', url.pathname)

  return new NextRequest(request.url, {
    ...request,
    headers: requestHeaders,
  })
}

export const middleware = (
  request: NextRequest,
  event: AppRouteHandlerFnContext,
): NextResponse => {
  const requestWithHeaders = setRequestHeaders(request)

  return authMiddleware(() => {
    return i18nMiddleware(requestWithHeaders)
  })(requestWithHeaders, event) as NextResponse
}

export const config = {
  matcher: [
    '/',
    '/(en|da|es|de)/:path*',
    '/((?!api|_next/static|_next/image|.png).*)',
  ],
}

export default middleware
