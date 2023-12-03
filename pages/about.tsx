import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { FC } from 'react'

/**
 * About page for YourKitchen, describing the project.
 */
const AboutPage: FC = () => {
  return (
    <div>
      <NextSeo title="About" description="About page describing the project" />
      AboutPage
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: locale
      ? {
          ...(await serverSideTranslations(locale, [
            'common',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {},
  }
}

export default AboutPage
