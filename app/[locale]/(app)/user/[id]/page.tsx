'use client'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  List,
  ListItem,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { type FeedItem, Follows, type Rating, type User } from '@prisma/client'
import { DateTime } from 'luxon'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { NextSeo, ProfilePageJsonLd } from 'next-seo'
import Image from 'next/image'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import Logo from '#assets/Logo-512x512.png'
import TabPanel from '#components/Account/TabPanel'
import YKChip from '#components/Recipe/YKChip'
import { auth } from '#misc/auth'
import type { PublicRecipe } from '#models/publicRecipe'
import type { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { useParams } from 'next/navigation'

type PublicUser = Pick<User, 'id' | 'image' | 'name' | 'created'>

interface UserPageProps {
  ownUser: Session['user']
  user: PublicUser & {
    feeditems: FeedItem[]
    followers: PublicUser[]
    following: PublicUser[]
    ratings: Rating[]
    recipes: PublicRecipe[]
  }
}

const UserPage = async () => {
  const params = useParams<{ id: string }>()

  const { data: user } = useSWR<YKResponse<UserPageProps['user']>>(
    `user/${params.id}`,
  )

  // Auth
  const { data: session } = useSession({
    required: true,
  })

  const ownUser = session?.user

  const t = useTranslations('common')

  const [tab, setTab] = useState(0)
  const [followDialogOpen, setFollowDialogOpen] = useState<
    null | 'followers' | 'following'
  >(null)
  const [following, setFollowing] = useState(
    user?.data.followers.some((follower) => follower),
  )

  const followClick = (type: 'followers' | 'following') => {
    setFollowDialogOpen(type)
  }

  const updateFollowState = async () => {
    try {
      setFollowing((prev) => !prev)
      const response = await api.put<YKResponse<boolean>>(
        `database/user/${user?.data.id}/follow`,
      )

      console.log(response.data.data)

      setFollowing(response.data.data)
    } catch (err) {
      // Reset the following state
      setFollowing((prev) => !prev)
      toast.error(err.message ?? err)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ProfilePageJsonLd
        breadcrumb={'user'}
        mainEntity={{
          '@type': 'Person',
          name: user.data.name ?? 'User',
          identifier: user.data.id,
          image: user.data.image ?? undefined,
          interactionStatistic: [
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/FollowAction',
              userInteraactionCount: user?.data.followers.length,
            },
          ],
        }}
        dateCreated={user.data.created as any}
      />
      <NextSeo
        title={user.data.name ?? 'User'}
        description={t('user_default_description')}
      />
      <Dialog
        open={followDialogOpen !== null}
        onClose={() => setFollowDialogOpen(null)}
      >
        <DialogTitle>{t(followDialogOpen as string)}</DialogTitle>
        <DialogContent>
          {/* Show list of selected type of follow */}
          <List>
            {user.data[followDialogOpen as 'followers' | 'following']?.map(
              (followUser) => (
                <Link href={`/user/${followUser.id}`} key={followUser.id}>
                  <ListItem>
                    <Image
                      alt={`${followUser.name}'s profile picture`}
                      width={30}
                      height={30}
                      src={followUser.image ?? Logo}
                    />
                    {followUser.name}
                  </ListItem>
                </Link>
              ),
            )}
          </List>
        </DialogContent>
        <DialogActions onClick={() => setFollowDialogOpen(null)}>
          {t('okay')}
        </DialogActions>
      </Dialog>
      <Image
        alt={`${user?.data.name}'s profile picture`}
        width={256}
        height={256}
        style={{
          borderRadius: 128,
        }}
        src={user?.data.image ?? Logo}
      />
      <Typography variant="h1">{user?.data.name}</Typography>
      <Box sx={{ display: 'flex', my: 1, gap: 1 }}>
        <YKChip
          label={`${user?.data.recipes.length} ${t(
            user?.data.recipes.length === 1 ? 'recipe' : 'recipes',
          )}`}
        />
        <YKChip
          label={`${t('joined_in')} ${DateTime.fromISO(
            user?.data.created as any,
          ).get('year')}`}
        />
      </Box>
      <Button
        variant="contained"
        sx={{ my: 1 }}
        color={following ? 'secondary' : 'primary'}
        onClick={updateFollowState}
      >
        {following ? t('following') : t('follow')}
      </Button>
      <Box sx={{ display: 'flex' }}>
        <Button onClick={() => followClick('followers')}>
          <Box sx={{ textAlign: 'center' }}>
            {user?.data.followers.length}
            <br />
            {t('followers')}
          </Box>
        </Button>
        <Button onClick={() => followClick('following')}>
          <Box sx={{ textAlign: 'center' }}>
            {user?.data.following.length}
            <br />
            {t('following')}
          </Box>
        </Button>
      </Box>
      <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)}>
        <Tab value={0} label={t('recipes')} />
        <Tab value={1} label={t('feed')} />
      </Tabs>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <TabPanel value={tab} index={0}>
          <Grid
            sx={{
              width: { sm: '300px', md: '930px' },
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
            columns={3}
          >
            {user?.data.recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipe/${recipe.id}`}
                sx={{
                  display: 'block',
                  width: '300px',
                  height: '300px',
                  backgroundColor: 'var(--mui-palette-background-default)',
                  color: 'var(--mui-palette-text-primary)',
                  backgroundImage: `url(${recipe.image?.[0].link})`,
                  backgroundSize: 'cover',
                  borderRadius: 2,
                  transition: '0.25s',
                  position: 'relative',
                  fontSize: '25px',

                  '&:hover': {
                    boxShadow: 'inset 0 0 0 2000px rgba(0,0,0, 0.3)',
                  },
                  '&:hover:after': {
                    color: 'white',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '100px',
                    right: '5px',
                    left: '5px',
                    content: `"${recipe.name}"`,
                  },
                }}
              />
            ))}
          </Grid>
        </TabPanel>
        <TabPanel value={tab} index={0}>
          {/* TODO: Implement the feed view for the user?.data. */}
        </TabPanel>
      </Box>
    </Box>
  )
}

export default UserPage
