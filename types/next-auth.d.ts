import type { User } from 'prisma/generated/prisma/client'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User & {
      followerCount: number
      followingCount: number
      score: number
    }
  }
}
