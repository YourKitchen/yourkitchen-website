import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'da']

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)

export const localeNames: Record<'en' | 'da', string> = {
  en: 'English',
  da: 'Danish',
}
