'use client'
import { IconButton, Menu, MenuItem, Typography } from '@mui/material'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { type FC, useState } from 'react'

interface Page {
  label: string
  href: string
  authState?: 'authenticated' | 'unauthenticated'
}

interface UserMenuProps {
  user: Session['user']
  settings: Page[]
}

const UserMenu: FC<UserMenuProps> = ({ user, settings }) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleToggleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser((prev) => (prev ? null : event.currentTarget))
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  return (
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
          alt={user.name || ''}
          src={user.image || ''}
        />
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {settings.map((page) => (
          <MenuItem key={page.label} LinkComponent={Link} href={page.href}>
            <Typography textAlign="center">{page.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default UserMenu
