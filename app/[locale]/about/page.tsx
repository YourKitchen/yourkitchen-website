import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import type { FC } from 'react'

/**
 * About page for YourKitchen, describing the project.
 */
const AboutPage: FC = async () => {
  return (
    <div>
      <NextSeo title="About" description="About page describing the project" />
      AboutPage
    </div>
  )
}

export default AboutPage
