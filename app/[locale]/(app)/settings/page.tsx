'use client'
import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material'
import type { User } from '@prisma/client'
import type { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { type FC, useState } from 'react'
import { toast } from 'sonner'
import AccountUpdateBox from '#components/Account/AccountUpdateBox'
import AccountTabPanel from '#components/Account/TabPanel'
import type { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'

enum SettingsTab {
  General = 0,
  Privacy = 1,
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
  const t = useTranslations('settings')
  // Auth
  const {
    data: session,
    status,
    update,
  } = useSession({
    required: true,
  })

  // States
  const [value, setValue] = useState(SettingsTab.General)

  if (status === 'loading' || !session) {
    return <CircularProgress />
  }

  const updateUser = async (user: Partial<Omit<User, 'id'>>) => {
    const { image, ...rest }: any = user

    if (image) {
      // Upload image has to be handled seperately
      // The type is actually File, because it has been selected using input[type='file']
      const actualImage = image as any as File

      // Upload the file using database/user/image
      toast.loading(`${t('uploading_image')}..`, {
        id: 'updating_user', // Allow the following promise to continue on this toast.
        duration: 30000,
      })
      const response = await api.post<YKResponse<string>>(
        'database/user/image',
        actualImage,
      )

      // Set the url of the uploaded image to the rest image endpoint.
      rest.image = response.data.data as string
    }
    toast.promise(update(rest), {
      id: 'updating_user',
      loading: `${t('updating')} ${t('user')}..`,
      error: (err) => err.message || err,
      success: `${t('succesfully_updated')} ${t('user')}`,
    })
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
        <AccountTabPanel
          key="general"
          value={value}
          index={SettingsTab.General}
        >
          <AccountUpdateBox
            t={t}
            key="personal-information"
            label="Personal Information"
            defaultObject={session.user}
            cells={[
              { field: 'name', label: t('name') },
              { field: 'image', type: 'image', label: t('profile_picture') },
              { field: 'email', label: t('email'), disabled: true },
              {
                field: 'defaultPersons',
                type: 'number',
                label: t('default_persons'),
              },
              {
                field: 'allergenes',
                type: 'allergenes',
                label: t('allergenes'),
              },
            ]}
            onSave={updateUser}
          />
        </AccountTabPanel>
      </Box>
    </Box>
  )
}

export default UserPage
