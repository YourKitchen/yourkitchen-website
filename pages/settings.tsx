import {
  Box,
  Button,
  CircularProgress,
  Link,
  Tab,
  Table,
  Tabs,
  Typography,
  tabClasses,
} from '@mui/material'
import { User } from '@prisma/client'
import { GetStaticProps } from 'next'
import withAuth from 'next-auth/middleware'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { FC, useState } from 'react'
import useSWR from 'swr'
import AccountBox from '#components/Account/AccountBox'
import AccountTabPanel from '#components/Account/AccountTabPanel'
import AccountUpdateBox from '#components/Account/AccountUpdateBox'
import { api } from '#network/index'

export enum SettingsTab {
  General = 0,
  Privacy = 1,
  Websites = 2,
  Team = 3,
}

interface PageInfo {
  title: string
  tab: SettingsTab
}

const pageInfo: PageInfo[] = [
  {
    title: 'General',
    tab: SettingsTab.General,
  },
  {
    title: 'Privacy',
    tab: SettingsTab.Privacy,
  },
]

const UserPage: FC = () => {
  // Translations
  const { t } = useTranslation('settings')
  // Auth
  const { data: session, status, update } = useSession()

  // States
  const [value, setValue] = useState(SettingsTab.General)

  if (status === 'loading') {
    return <CircularProgress />
  }
  if (status === 'unauthenticated' || !session) {
    return (
      <Box>
        <Typography>
          You need to be logged in to access your account settings
        </Typography>
        <Link href="/auth/signin">Login</Link>
      </Box>
    )
  }

  const updateUser = async (user: Partial<Omit<User, 'id'>>) => {
    const response = await update(user)
  }

  return (
    <Box sx={{ margin: { xs: 0, sm: 0, md: 8 }, my: { xs: 4, sm: 4, md: 0 } }}>
      <NextSeo title="Settings" />
      <Box sx={{ alignItems: 'center', display: 'flex' }}>
        <Image
          width={80}
          height={80}
          style={{
            borderRadius: '40px',
          }}
          referrerPolicy="no-referrer"
          alt={session.user.name || 'No name'}
          src={session.user.image ?? ''}
        />
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginLeft: '1rem',
          }}
        >
          {session.user.name}
        </Typography>
      </Box>
      <Box
        sx={{
          my: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Tabs
          value={value}
          onChange={(_, value) => setValue(value as number)}
          sx={{
            alignSelf: 'center',
          }}
        >
          {pageInfo.map((pageInfo) => (
            <Tab key={pageInfo.tab} label={pageInfo.title} />
          ))}
        </Tabs>
        <AccountTabPanel value={value} index={SettingsTab.General}>
          <AccountUpdateBox
            t={t}
            label="Personal Information"
            object={session.user}
            cells={[
              { field: 'name', label: 'Name' },
              { field: 'email', label: 'Email', disabled: true },
              {
                field: 'defaultPersons',
                type: 'number',
                label: 'Default Persons',
              },
            ]}
            onSave={updateUser}
          />
        </AccountTabPanel>
      </Box>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: locale
      ? {
          ...(await serverSideTranslations(locale, [
            'settings',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {},
  }
}

export default UserPage
