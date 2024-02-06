import Logo from '#assets/Logo-192x192.png'
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
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import useTheme from '@mui/system/useTheme'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useRouter as useNavigation } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from '../Link'

interface Page {
  label: string
  href: string
  authState?: 'authenticated' | 'unauthenticated'
}

export const Header: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { data: session, status } = useSession()
  const theme = useTheme()
  const { t } = useTranslation('header')

  const router = useRouter()
  const navigation = useNavigation()
  const [scrollY, setScrollY] = useState(0)

  const pages: Page[] = useMemo(
    () => [
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
    ],
    [t],
  )

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
  ]

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const isMenuOpen = Boolean(anchorElNav)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

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

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleToggleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser((prev) => (prev ? null : event.currentTarget))
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleMobileMenuClose = (): void => {
    setMobileMoreAnchorEl(null)
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const onPageClick = (page: Page) => {
    navigation.push(page.href)
  }

  const mobileMenuId = 'primary-menu-mobile'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {settings.map(
        (page) =>
          (page.authState === undefined || page.authState === status) && (
            <MenuItem key={page.label} onClick={() => onPageClick(page)}>
              {page.label}
            </MenuItem>
          ),
      )}
    </Menu>
  )

  const selectedBackgroundColor = useMemo(() => {
    return theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.8)'
      : 'rgba(0,0,0, 0.8)'
  }, [theme.palette.mode])

  return (
    <AppBar
      position="sticky"
      sx={{
        backdropFilter: 'blur(7px)',
        backgroundColor: scrollY < 30 ? 'transparent' : selectedBackgroundColor,
        backgroundImage: 'none',
        color: theme.palette.text.primary,
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
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={isMenuOpen}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map(
                (page) =>
                  (page.authState === undefined ||
                    page.authState === status) && (
                    <MenuItem
                      key={page.label}
                      onClick={() => onPageClick(page)}
                    >
                      <Typography textAlign="center">{page.label}</Typography>
                    </MenuItem>
                  ),
              )}
            </Menu>
          </Box>
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
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            YourKitchen
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map(
              (page) =>
                (page.authState === undefined || page.authState === status) && (
                  <Button
                    key={page.label}
                    href={page.href}
                    sx={{
                      mx: 1,
                      textAlign: 'center',
                      display: 'block',
                      position: 'relative',
                      color: (theme) => theme.palette.text.primary,
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
                        backgroundColor: (theme) => theme.palette.primary.main,
                        width: router.pathname === page.href ? '100%' : '0%',
                      },
                    }}
                  >
                    {page.label}
                  </Button>
                ),
            )}
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
              <>
                <IconButton
                  onClick={handleToggleUserMenu}
                  sx={{
                    width: '40px',
                    height: '40px',
                    p: 0,
                    borderRadius: '20px',
                  }}
                >
                  <Image
                    referrerPolicy="no-referrer"
                    width={40}
                    height={40}
                    style={{ borderRadius: '20px' }}
                    alt={session.user.name || ''}
                    src={session.user.image || ''}
                  />
                </IconButton>
                <Menu
                  id="user-menu"
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map(
                    (page) =>
                      (page.authState === undefined ||
                        page.authState === status) && (
                        <MenuItem
                          key={page.label}
                          onClick={() => onPageClick(page)}
                        >
                          <Typography textAlign="center">
                            {page.label}
                          </Typography>
                        </MenuItem>
                      ),
                  )}
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={() => onPageClick(settings[0])}
                  sx={{ display: 'block' }}
                >
                  {settings[0].label}
                </Button>
              </>
            )}
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              sx={{ marginRight: '2vh' }}
              aria-label="show more"
              aria-haspopup="true"
              aria-controls={mobileMenuId}
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Box>
      {renderMobileMenu}
    </AppBar>
  )
}

export default Header
