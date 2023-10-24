import { Box, Link, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Image from 'next/image'
import { FC } from 'react'
import AppStoreBadge from '#assets/AppStoreBadge.svg'
import logo from '#assets/Logo-192x192.png'

const HomePage: FC = () => {
  const { t } = useTranslation('common')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          mt: 8,
        }}
      >
        <Image
          className="logo"
          height={192}
          width={192}
          src={logo}
          alt="Logo"
        />
        <Typography variant="h2">YourKitchen</Typography>
        <Typography fontSize={24} variant="subtitle1">
          Keep track of your kitchen
        </Typography>
        <Box
          sx={{
            flexDirection: 'row',
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <Link href="https://play.google.com/store/apps/details?id=com.unknownstudios.yourkitchen&hl=da&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
            <Image
              height={60}
              width={140}
              alt="Get it on Google Play"
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            />
          </Link>
          <Link href="https://apps.apple.com/us/app/yourkitchen/id1587896995">
            <Image
              height={50}
              width={120}
              alt="Download app on App store"
              src={AppStoreBadge}
            />
          </Link>
        </Box>
      </Box>
      <Box sx={{ display: 'flex' }}>
        <Typography variant="h4">{t('explore')}</Typography>
        {/* TODO: Create different playlists that are shown here (Most popular in different categories) */}
      </Box>
    </Box>
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

export default HomePage
