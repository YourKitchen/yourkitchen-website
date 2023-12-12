import Logo from '#assets/Logo-512x512.png'
import TabPanel from '#components/Account/TabPanel'
import Link from '#components/Link'
import YKChip from '#components/Recipe/YKChip'
import { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { PublicRecipe } from '#pages/recipes'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { FeedItem, Rating, User } from '@prisma/client'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { Session, getServerSession } from 'next-auth'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo, ProfilePageJsonLd } from 'next-seo'
import Image from 'next/image'
import { FC, useState } from 'react'

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

const UserPage: FC<UserPageProps> = ({ ownUser, user }) => {
  const { t } = useTranslation('common')

  const [tab, setTab] = useState(0)
  const [followDialogOpen, setFollowDialogOpen] = useState<
    null | 'followers' | 'following'
  >(null)

  const followClick = (type: 'followers' | 'following') => {
    setFollowDialogOpen(type)
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
          name: user.name ?? 'User',
          identifier: user.id,
          image: user.image ?? undefined,
          interactionStatistic: [
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/FollowAction',
              userInteraactionCount: user.followers.length,
            },
          ],
        }}
        dateCreated={user.created as any}
      />
      <NextSeo
        title={user.name ?? 'User'}
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
            {user[followDialogOpen as 'followers' | 'following'].map(
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
        alt={`${user.name}'s profile picture`}
        width={256}
        height={256}
        style={{
          borderRadius: 128,
        }}
        src={user.image ?? Logo}
      />
      <Typography variant="h1">{user.name}</Typography>
      <Box sx={{ display: 'flex', my: 1, gap: 1 }}>
        <YKChip
          label={`${user.recipes.length} ${t(
            user.recipes.length === 1 ? 'recipe' : 'recipes',
          )}`}
        />
        <YKChip
          label={`${t('joined_in')} ${DateTime.fromISO(user.created as any).get(
            'year',
          )}`}
        />
      </Box>
      <Box sx={{ display: 'flex' }}>
        <Button onClick={() => followClick('followers')}>
          <Box sx={{ textAlign: 'center' }}>
            {user.followers.length}
            <br />
            {t('followers')}
          </Box>
        </Button>
        <Button onClick={() => followClick('following')}>
          <Box sx={{ textAlign: 'center' }}>
            {user.following.length}
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
            {user.recipes.map((recipe) => (
              <Link
                href={`/recipe/${recipe.id}`}
                sx={{
                  display: 'block',
                  width: '300px',
                  height: '300px',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? '#fff' : '#000',
                  color: (theme) => theme.palette.text.primary,
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
          {/* TODO: Implement the feed view for the user. */}
        </TabPanel>
      </Box>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const userResponse = await api.get<YKResponse<User>>(
      `database/user/${context.params?.id}`,
    )

    const session = await getServerSession(
      context.req,
      context.res,
      authOptions,
    )

    if (!userResponse) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        ownUser: session ? JSON.parse(JSON.stringify(session.user)) : null,
        user: JSON.parse(JSON.stringify(userResponse.data.data)),
        ...(context.locale
          ? {
              ...(await serverSideTranslations(context.locale, [
                'common',
                'header',
                'footer',
              ])),
            }
          : {}),
      },
    }
  } catch (err) {
    return {
      notFound: true,
    }
  }
}

export default UserPage
