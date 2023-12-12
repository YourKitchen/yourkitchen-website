import { setPerson } from 'green-analytics-js'
import { useSession } from 'next-auth/react'
import { FC, PropsWithChildren, useEffect } from 'react'

const AnalyticsWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      const user = session.user
      setPerson({
        id: user.id,
        email: user.email,
        name: user.name ?? 'No name',
        properties: {
          // Only log public information
          followers: user.followerCount,
          following: user.followingCount,
          score: user.score,
        },
      })
    }
  }, [session])

  return <>{children}</>
}

export default AnalyticsWrapper
