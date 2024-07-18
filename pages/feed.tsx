import type { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

/**
 * Show a feed for the social media aspect.
 */
const FeedPage = () => {
  // This page requires auth
  const session = useSession({
    required: true,
  })

  return <div>FeedPage</div>
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

export default FeedPage
