import { Box, Link, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { FC, ReactElement } from 'react'
// src/components/Footer.tsx
import yourkitchenLogo from '#assets/Logo-192x192.png'
import LanguageSelect from './LanguageSelect'

export const Footer: FC = (): ReactElement => {
  const { t } = useTranslation('footer')

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
      <Box sx={{ display: 'flex', margin: '0 128px' }}>
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
              color: (theme) => theme.palette.primary.main,
              fontSize: '25px',
            }}
          >
            YourKitchen
          </Typography>
          <Typography variant="body2">
            {`${new Date().getFullYear()} © Unknown Studios`}
          </Typography>
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
          <LanguageSelect />
          <Link href="/cookies" variant="body2">
            {t('cookie_policy')}
          </Link>
          {/* <Link href="/terms" variant="body2">
            {t('terms_of_service')}
          </Link> */}
          <Link href="/privacy" variant="body2">
            {t('privacy_policy')}
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
