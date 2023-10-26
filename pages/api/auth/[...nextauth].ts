import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient, User } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'
import NextAuth, { AuthOptions, Session } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import EmailProvider from 'next-auth/providers/email'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import { v4 } from 'uuid'
import prisma from '../_base'

// Setup next-auth with 4 providers (passwordless, facebook, google, apple)
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: `YourKitchen <${process.env.GMAIL_FROM}>`,
      server: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_FROM, // Your email address
          serviceClient: process.env.GMAIL_CLIENT_ID,
          privateKey: process.env.GMAIL_PRIVATE_KEY,
          accessUrl: process.env.GMAIL_TOKEN_URL,
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET ?? '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_AUTH_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    session: async ({ session, token, trigger, newSession }) => {
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
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.id
        token.user = user
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    verifyRequest: '/auth/verify',
  },
  session: {
    strategy: 'database',
  },
}

export default NextAuth(authOptions)
