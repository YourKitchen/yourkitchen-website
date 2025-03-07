import { Box, Link, Typography } from '@mui/material'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { FC } from 'react'
import AppStoreBadge from '#assets/AppStoreBadge.svg'
import logo from '#assets/Logo-512x512.png'
import ExploreRow from '#components/Explore/ExploreRow'
import type { PublicRecipe } from '#models/publicRecipe'
import type { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'

const HomePage: FC = async () => {
  const t = await getTranslations('common')

  const response = await api.get<YKResponse<PublicRecipe[]>>(
    '/database/recipe/popular',
  )
  const popularRecipes = response.data

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
      <Box sx={{ width: '100%', display: 'inline-block' }}>
        <Box sx={{ paddingInline: 2 }}>
          <Typography sx={{ my: 2 }} variant="h4">
            {t('popular_recipes')}
          </Typography>
          <Typography sx={{ my: 2 }}>{t('explore_description')}</Typography>
        </Box>
        <ExploreRow recipes={popularRecipes?.data ?? []} />
      </Box>
    </Box>
  )
}

export default HomePage
