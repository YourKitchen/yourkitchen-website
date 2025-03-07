import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { NextSeo } from 'next-seo'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('common')

  return {
    title: t('cookie_policy'),
    description: t('cookie_policy'),
  }
}

const CookiesPage = async () => {
  return (
    <>
      <div id="green-analytics-cookie-policy" />
    </>
  )
}

export default CookiesPage
