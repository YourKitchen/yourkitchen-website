import { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { PublicRecipe } from '#pages/recipes'
import { FeedItem, Rating, User } from '@prisma/client'
import { GetServerSideProps } from 'next'
import { Session, getServerSession } from 'next-auth'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { FC } from 'react'

type PublicUser = Pick<User, 'id' | 'image' | 'name'>

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

  return (
    <div>
      <NextSeo
        title={user.name ?? 'User'}
        description={t('user_default_description')}
      />
      {user.name}
    </div>
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
