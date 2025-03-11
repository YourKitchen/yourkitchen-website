import Logo from '#assets/Logo-192x192.png'
import { auth } from '#misc/auth'
import { Add, AddCircleRounded } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { FC } from 'react'
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
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
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
            {pages.map((page) => (
              <Link
                key={page.label}
                href={page.href}
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
            <Tooltip title={t('create_recipe')}>
              <IconButton
                sx={{
                  display: 'flex',
                  gap: 1,
                  borderRadius: '13px',
                  fontWeight: '700',
                  fontSize: 20,
                  color: 'var(--mui-palette-primary-main)',
                }}
                component="a"
                href={'/recipe/create'}
              >
                <AddCircleRounded fontSize="medium" />
              </IconButton>
            </Tooltip>
            {session ? (
              <UserMenu user={session.user} settings={settings} />
            ) : (
              <>
                {settings.length > 0 ? (
                  <Button
                    href={settings[0].href}
                    sx={{
                      display: 'block',
                      borderRadius: '13px',
                      padding: '8px 16px',
                      backgroundColor: 'var(--mui-palette-primary-main)',
                      color: 'var(--mui-palette-primary-contrastText)',
                      ':hover': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                      },
                      ':active': {
                        backgroundColor: 'var(--mui-palette-primary-dark)',
                      },
                    }}
                    variant="contained"
                  >
                    {settings[0].label}
                  </Button>
                ) : null}
              </>
            )}
          </Box>
          <MobileHeader session={session} pages={pages} settings={settings} />
        </Toolbar>
      </Box>
    </AppBar>
  )
}

export default Header
