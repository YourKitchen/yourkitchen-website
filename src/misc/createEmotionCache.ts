import createCache, { EmotionCache } from '@emotion/cache'

const isBrowser = typeof document !== 'undefined'

/* On the client side, Create a meta tag at the top of the <head> and set it as insertionPoint.
 * This assures that MUI styles are loaded first.
 * It allows developers to easily override MUI styles with other styling solutions, like CSS modules.
 *
 */
export const createEmotionCache = (): EmotionCache => {
  let insertionPoint: HTMLMetaElement | undefined

  if (isBrowser) {
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]',
    )
    insertionPoint = emotionInsertionPoint ?? undefined
  }

  return createCache({ key: 'mui-style', insertionPoint })
}

export default createEmotionCache
