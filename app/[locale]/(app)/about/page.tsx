import { Typography } from '@mui/material'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
  const t = await getTranslations('about')

  return (
    <main>
      <Typography variant="h1">{t('title')}</Typography>
      <Typography variant="body1">{t('description')}</Typography>
      <section>
        <Typography variant="h2">{t('section_title')}</Typography>
        <Typography variant="body1">{t('section_content')}</Typography>
      </section>
    </main>
  )
}

export default AboutPage
