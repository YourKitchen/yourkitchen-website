import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'da']

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',
})

export const localeNames: Record<'en' | 'da', string> = {
  en: 'English',
  da: 'Danish',
}
