'use client'
import { Menu as MenuIcon, More } from '@mui/icons-material'
import {
  Box,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { pages } from 'next/dist/build/templates/app-page'
import type React from 'react'
import { type FC, useState } from 'react'

interface Page {
  label: string
  href: string
  authState?: 'authenticated' | 'unauthenticated'
}

interface MobileHeaderProps {
  pages: Page[]
  settings: Page[]
}

const MobileHeader: FC<MobileHeaderProps> = ({ settings, pages }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const isMenuOpen = Boolean(anchorElNav)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleMobileMenuClose = (): void => {
    setMobileMoreAnchorEl(null)
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const mobileMenuId = 'primary-menu-mobile'
  return (
    <>
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
        <Typography
          variant="h5"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: '.1rem',
            textDecoration: 'none',
            ':visited, :active, :hover': {
              color: 'var(--mui-palette-text-primary)',
            },
          }}
        >
          YourKitchen
        </Typography>
        <IconButton
          size="large"
          sx={{ marginRight: '2vh' }}
          aria-label="show more"
          aria-haspopup="true"
          aria-controls={mobileMenuId}
          onClick={handleMobileMenuOpen}
          color="inherit"
        >
          <More />
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
            <MenuItem LinkComponent={Link} key={page.label} href="">
              <Typography textAlign="center">{page.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
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
          {settings.map((page) => (
            <MenuItem LinkComponent={Link} key={page.label} href={page.href}>
              {page.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </>
  )
}

export default MobileHeader
