import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient, User } from '@prisma/client'
import NextAuth, { AuthOptions } from 'next-auth'
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
        console.log('new session', trigger, newSession)
      }
      const email = token?.email || session?.user?.email
      if (email) {
        const user: User | null = await prisma.user.findUnique({
          where: { email },
        })
        if (user) {
          session.user = user
        }
      }
      return session
    },
    jwt: async ({ token, user, session, trigger }) => {
      if (trigger === 'update') {
        // Update the serverside user.
        console.log('jwt', trigger, session)
      }
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