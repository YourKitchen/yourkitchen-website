import React from 'react'
import { auth } from '#misc/auth'

/**
 * Show a feed for the social media aspect.
 */
const FeedPage = async () => {
  // This page requires auth
  const session = await auth()

  if (!session) {
    return null
  }

  return <div>FeedPage</div>
}

export default FeedPage
