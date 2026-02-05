import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { type Session } from 'next-auth'
import type { User } from 'prisma/generated/prisma/client'
import authConfig from './auth.config'
import prisma from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    verifyRequest: '/auth/verify',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    session: async ({ token, session, trigger, newSession }) => {
      if (trigger === 'update') {
        if (trigger === 'update') {
          // If the trigger is update, update the user in prisma and return that as the session
          // Extract the valid keys that can be updated. (To prevent faulty request due to spreading)
          const {
            allergenes,
            defaultPersons,
            name,
            image,
            privacySettings,
            notificationSettings,
          } = newSession as Partial<User>
          const user = await prisma.user.update({
            data: {
              allergenes,
              defaultPersons,
              name,
              image,
              privacySettings: {
                toJSON: privacySettings,
              },
              notificationSettings: {
                toJSON: notificationSettings,
              },
            },
            where: {
              email: session.user.email,
            },
            include: {
              _count: {
                select: {
                  followers: true,
                  following: true,
                },
              },
            },
          })

          if (user) {
            // If we found the user, we also need the score for the user (Sum of ratings)
            const authUser: Partial<Session['user']> = user
            // The authUser is partial, because it needs to be formatted correctly.
            // We also need to get the score of the user.
            const scoreResponse = await prisma.rating.aggregate({
              where: {
                recipe: {
                  ownerId: user.id,
                },
              },
              _sum: {
                score: true,
              },
            })
            authUser.followerCount = user._count.followers
            authUser.followingCount = user._count.following
            authUser.score = scoreResponse._sum.score ?? 0

            session.user = authUser as Session['user']
          }

          return session
        }
      }
      const email = token?.email || session?.user?.email
      if (email) {
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        })
        if (user) {
          // If we found the user, we also need the score for the user (Sum of ratings)
          const authUser: Partial<Session['user']> = user
          // The authUser is partial, because it needs to be formatted correctly.
          // We also need to get the score of the user.
          const scoreResponse = await prisma.rating.aggregate({
            where: {
              recipe: {
                ownerId: user.id,
              },
            },
            _sum: {
              score: true,
            },
          })
          authUser.followerCount = user._count.followers
          authUser.followingCount = user._count.following
          authUser.score = scoreResponse._sum.score ?? 0

          session.user = authUser as Session['user']
        }
      }
      return session
    },
  },
  ...authConfig,
})
