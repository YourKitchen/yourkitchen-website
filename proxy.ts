import { routing } from 'i18n/routing'
import { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import type { AppRouteHandlerFnContext } from 'next-auth/lib/types'
import createMiddleware from 'next-intl/middleware'
import authConfig from '#misc/auth.config'

const { auth: authMiddleware } = NextAuth(authConfig)

const i18nMiddleware = createMiddleware(routing)

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
  ctx: AppRouteHandlerFnContext,
) => {
  const requestWithHeaders = setRequestHeaders(request)

  return authMiddleware(() => {
    return i18nMiddleware(requestWithHeaders)
  })(request, ctx)
}

export const config = {
  matcher: [
    '/',
    '/(en|da|es|de)/:path*',
    '/((?!api|_next/static|_next/image|.png).*)',
  ],
}

export default middleware
