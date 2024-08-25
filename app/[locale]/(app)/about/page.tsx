import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { NextSeo } from 'next-seo'
import type { FC } from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('common')

  return {
    title: t('about'),
    description: t('about_description'),
  }
}

/**
 * About page for YourKitchen, describing the project.
 */
const AboutPage: FC = async () => {
  return <div>AboutPage</div>
}

export default AboutPage
