import { notFound } from 'next/navigation'
import { createNavigation } from 'next-intl/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'da', 'es', 'de']

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale ?? 'en')) notFound()

  return {
    locale: locale ?? 'en',
    messages: (
      await (locale === 'en'
        ? // When using Turbopack, this will enable HMR for `en`
          import('./public/locales/en.json')
        : import(`./public/locales/${locale}.json`))
    ).default,
  }
})

export const { Link, useRouter, usePathname } = createNavigation({ locales })

export const localeNames: Record<Locale, string> = {
  en: 'EN',
  da: 'DK',
  de: 'DE',
  es: 'ES',
}
