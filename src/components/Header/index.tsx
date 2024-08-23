import {
  Add,
  Menu as MenuIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useRouter as useNavigation } from 'next/navigation'
import { useRouter } from 'next/router'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Logo from '#assets/Logo-192x192.png'
import { auth } from '#misc/auth'
import MobileHeader from './MobileHeader'
import UserMenu from './UserMenu'

export interface Page {
  label: string
  href: string
  authState?: 'authenticated' | 'unauthenticated'
}

export const Header: React.FC<React.PropsWithChildren<unknown>> = async () => {
  const session = await auth()

  // TODO: Change to next-translate for server side translations
  const { t } = useTranslation('header')

  // TODO: Pass router through middleware
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

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

  const onScroll = useCallback(() => {
    setScrollY(window.scrollY)
  }, [])

  useEffect(() => {
    //add eventlistener to window
    window.addEventListener('scroll', onScroll, { passive: true })
    // remove event on unmount to prevent a memory leak with the cleanup
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [onScroll])

  return (
    <AppBar
      position="sticky"
      sx={{
        backdropFilter: 'blur(7px)',
        backgroundColor:
          scrollY < 30
            ? 'transparent'
            : 'var(--mui-palette-background-default)',
        backgroundImage: 'none',
        color: 'var(--mui-palette-text-primary)',
        transition: '0.3s ease-in-out',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ margin: '0 15px' }}>
        <Toolbar disableGutters>
          <Link href="/">
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
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '.1rem',
              textDecoration: 'none',
            }}
          >
            YourKitchen
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
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
                    width: router.pathname === page.href ? '100%' : '0%',
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
              gap: '8px',
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <Button
              sx={{ display: 'flex', gap: 1 }}
              variant="contained"
              href={'/recipe/create'}
            >
              <Add />
              {t('create')}
            </Button>
            {session ? (
              <UserMenu user={session.user} settings={settings} />
            ) : (
              <>
                {settings.length > 0 ? (
                  <Link href={settings[0].href} sx={{ display: 'block' }}>
                    {settings[0].label}
                  </Link>
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
