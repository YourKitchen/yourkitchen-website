import { Add } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  Link,
  Toolbar,
  Typography,
  styled,
} from '@mui/material'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type React from 'react'
import type { FC } from 'react'
import Logo from '#assets/Logo-192x192.png'
import { auth } from '#misc/auth'
import MobileHeader from './MobileHeader'
import UserMenu from './UserMenu'

interface Page {
  label: string
  href: string
  authState?: 'authenticated' | 'unauthenticated'
}

const Header: FC = async () => {
  const session = await auth()

  const t = await getTranslations('header')

  // const { scrollY } = useScroll()

  const pages: Page[] = [
    {
      label: t('home'),
      href: '/',
    },
    {
      label: t('about'),
      href: '/about',
    },
    {
      label: t('recipes'),
      href: '/recipes',
    },
    {
      label: t('meal_plan'),
      href: '/meal-plan',
      authState: 'authenticated',
    },
  ].filter(
    (page) =>
      page.authState === undefined ||
      page.authState === (session ? 'authenticated' : 'unauthenticated'),
  ) as Page[]

  const getLink = (page: Page) => {
    if (page.authState === 'authenticated') {
      if (!session) {
        return `/auth/signin?callbackUrl=${page.href}`
      }
    }
    return page.href
  }

  const settings: Page[] = [
    { label: t('settings'), href: '/settings', authState: 'authenticated' },
    {
      label: t('logout'),
      href: '/auth/signout',
      authState: 'authenticated',
    },
    {
      label: t('get_started'),
      href: '/auth/signin',
      authState: 'unauthenticated',
    },
  ].filter(
    (page) =>
      page.authState === undefined ||
      page.authState === (session ? 'authenticated' : 'unauthenticated'),
  ) as Page[]

  return (
    <AppBar
      position="sticky"
      sx={{
        backdropFilter: 'blur(7px)',
        backgroundColor:
          // scrollY.get() < 30
          //   ? 'transparent'
          //   :
          'var(--mui-palette-background-default)',
        backgroundImage: 'none',
        color: 'var(--mui-palette-text-primary)',
        transition: '0.3s ease-in-out',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ margin: '0 15px' }}>
        <Toolbar disableGutters>
          <Link
            sx={{
              display: {
                xs: 'none',
                sm: 'flex',
              },
            }}
            href="/"
          >
            <Image
              width={40}
              height={40}
              style={{ borderRadius: '20px' }}
              src={Logo}
              alt="YourKitchen Logo"
            />
          </Link>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mx: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            YourKitchen
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link
                key={page.label}
                href={getLink(page)}
                sx={{
                  mx: 1,
                  textAlign: 'center',
                  display: 'block',
                  position: 'relative',
                  color: 'var(--mui-palette-text-primary)',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    '&:after': {
                      width: '80%',
                    },
                  },
                  '&:after': {
                    transition: 'width 0.2s ease-in-out',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'block',
                    content: '""',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--mui-palette-primary-main)',
                  },
                }}
              >
                {page.label}
              </Link>
            ))}
          </Box>
          {/* DIVIDER */}
          <Box
            sx={{
              height: '40.5px',
              gap: 2,
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <Button
              sx={{
                display: 'flex',
                gap: 1,
                backgroundColor: 'var(--mui-palette-primary-main)',
                color: 'var(--mui-palette-primary-contrastText)',
                borderRadius: '13px',
                padding: '8px 16px',

                ':hover': {
                  backgroundColor: 'var(--mui-palette-primary-main)',
                },
                ':active': {
                  backgroundColor: 'var(--mui-palette-primary-dark)',
                },
              }}
              variant="contained"
              href={getLink({
                href: '/recipe/create',
                label: t('create'),
                authState: 'authenticated',
              })}
            >
              <Add />
              {t('create')}
            </Button>
            {session ? (
              <UserMenu user={session.user} settings={settings} />
            ) : (
              <>
                {settings.length > 0 ? (
                  <Button
                    href={getLink(settings[0])}
                    sx={{
                      display: 'block',
                      color: 'var(--mui-palette-primary-main)',
                      borderRadius: '13px',
                      padding: '8px 16px',

                      ':hover': {
                        color: 'var(--mui-palette-primary-main)',
                      },
                      ':active': {
                        color: 'var(--mui-palette-primary-dark)',
                      },
                    }}
                  >
                    {settings[0].label}
                  </Button>
                ) : null}
              </>
            )}
          </Box>
          <MobileHeader pages={pages} settings={settings} />
        </Toolbar>
      </Box>
    </AppBar>
  )
}

export default Header
