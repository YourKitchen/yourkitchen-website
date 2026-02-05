'use client'
import { Menu as MenuIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import type React from 'react'
import { type FC, useState } from 'react'
import Logo from '#assets/Logo-192x192.png'
import UserMenu from './UserMenu'
import type { Session } from 'next-auth'

interface Page {
  label: string
  href: string
  authState?: 'authenticated' | 'unauthenticated'
}

interface MobileHeaderProps {
  session: Session | null
  pages: Page[]
  settings: Page[]
}

const MobileHeader: FC<MobileHeaderProps> = ({ session, settings, pages }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const isMenuOpen = Boolean(anchorElNav)
  const _isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const _handleMobileMenuClose = (): void => {
    setMobileMoreAnchorEl(null)
  }

  const _handleMobileMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
  ): void => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const _mobileMenuId = 'primary-menu-mobile'
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'space-between',
      }}
    >
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
          '& .MuiPaper-root': {
            backgroundColor: 'var(--mui-palette-background-paper)',
            color: 'var(--mui-palette-text-primary)',
          },
        }}
      >
        {pages.map((page) => (
          <MenuItem LinkComponent={Link} key={page.label} href={page.href}>
            <Typography textAlign="center">{page.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {session ? (
        <UserMenu user={session.user} settings={settings} />
      ) : settings.length > 0 ? (
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
    </Box>
  )
}

export default MobileHeader
