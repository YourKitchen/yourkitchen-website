import { notFound } from 'next/navigation'
import { locales, routing } from './routing'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid

  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }
  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }
  if (!locales.includes(locale)) notFound()

  return {
    locale,
    messages: (
      await (locale === 'en'
        ? // When using Turbopack, this will enable HMR for `en`
          import('../public/locales/en.json')
        : import(`../public/locales/${locale}.json`))
    ).default,
  }
})
