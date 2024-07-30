import { setPerson } from 'green-analytics-js'
import { useSession } from 'next-auth/react'
import { type FC, type PropsWithChildren, useEffect } from 'react'

const AnalyticsWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
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
  }, [session, status])

  return <>{children}</>
}

export default AnalyticsWrapper
