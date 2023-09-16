import Logo from '#src/assets/Logo-192x192.png'
import {
  Description,
  Logout,
  Menu as MenuIcon,
  MoreVert as MoreIcon,
  Settings,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import useTheme from '@mui/system/useTheme'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useRouter as useNavigation } from 'next/navigation'
import { useRouter } from 'next/router'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Link from '../Link'
import LanguageSelect from './LanguageSelect'
import { useUser } from '@auth0/nextjs-auth0/client'

export const Header: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { user, isLoading, error } = useUser()
  const theme = useTheme()
  const { t } = useTranslation('header')

  const router = useRouter()
  const navigation = useNavigation()
  const [scrollY, setScrollY] = useState(0)

  const pages: { name: string; path: string }[] = useMemo(
    () => [
      {
        name: t('home'),
        path: '/',
      },
      {
        name: t('about'),
        path: '/about',
      },
      {
        name: t('recipes'),
        path: '/recipes',
      },
    ],
    [router.pathname],
  )

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const isMenuOpen = Boolean(anchorElNav)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const onScroll = useCallback(() => {
    console.log(window.scrollY)
    setScrollY(window.scrollY)
  }, [])

  useEffect(() => {
    //add eventlistener to window
    window.addEventListener('scroll', onScroll, { passive: true })
    // remove event on unmount to prevent a memory leak with the cleanup
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = (): void => {
    setAnchorElNav(null)
    handleMobileMenuClose()
  }

  const handleMobileMenuClose = (): void => {
    setMobileMoreAnchorEl(null)
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const logout = (): void => {
    navigation.replace('/api/auth/logout')
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
      {!user ? (
        <MenuItem {...{ component: 'a', href: '/api/auth/login' }}>
          <Settings />
          <p>{t('sign_in')}</p>
        </MenuItem>
      ) : (
        <MenuItem {...{ component: 'a', href: '/api/auth/logout' }}>
          <Logout />
          <p>{t('logout')}</p>
        </MenuItem>
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
              {pages.map((page) => (
                <MenuItem
                  key={page.name}
                  {...{ component: 'a', href: page.path }}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
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
            {pages.map((page) => (
              <Button
                key={page.name}
                href={page.path}
                sx={{
                  my: 2,
                  mx: 1,
                  textAlign: 'center',
                  color:
                    router.pathname === page.path
                      ? 'white'
                      : theme.palette.text.primary,
                  backgroundColor:
                    router.pathname === page.path
                      ? theme.palette.primary.main
                      : '',
                  display: 'block',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    boxShadow:
                      '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                    color: 'white',
                  },
                }}
              >
                {page.name}
              </Button>
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
            <LanguageSelect />
            {!user ? (
              <Button
                key={'signinButton'}
                href={'/app'}
                variant="contained"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  display: 'block',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    boxShadow:
                      '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                    color: 'white',
                  },
                }}
              >
                {t('sign_in')}
              </Button>
            ) : (
              <Tooltip title={t('logout')}>
                <IconButton
                  onClick={logout}
                  size="small"
                  aria-label="Sign out of your account"
                  color="inherit"
                >
                  <Logout />
                </IconButton>
              </Tooltip>
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
