import { Box, Link, Typography } from '@mui/material'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { FC, ReactElement } from 'react'
import yourkitchenLogo from '#assets/Logo-192x192.png'
import LanguageSelect from './LanguageSelect'

const Footer: FC<{ locale: string }> = async ({ locale }) => {
  const t = await getTranslations('footer')

  return (
    <Box
      sx={{
        width: '100%',
        height: 'auto',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        mt: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          margin: { xs: 0, sm: '0 128px' },
          alignItems: { xs: 'center', sm: 'initial' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <Image
            priority={false}
            src={yourkitchenLogo}
            loading="lazy"
            alt="YourKitchen Logo"
            width={60}
            height={60}
          />
          <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography
              sx={{
                color: 'var(--mui-palette-primary-main)',
                fontSize: '25px',
              }}
            >
              YourKitchen
            </Typography>
            <Typography variant="body2">
              {`${new Date().getFullYear()} © Unknown Studios`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <LanguageSelect locale={locale} />
          <Link
            href="/cookies"
            sx={{
              textDecoration: 'none',
              color: '#ffffff',
            }}
            variant="body2"
          >
            {t('cookie_policy')}
          </Link>
          {/* <Link href="/terms" variant="body2">
            {t('terms_of_service')}
          </Link> */}
          <Link
            href="/privacy"
            sx={{
              textDecoration: 'none',
              color: '#ffffff',
            }}
            variant="body2"
          >
            {t('privacy_policy')}
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
