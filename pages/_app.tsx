import { Footer } from '#src/components/Footer'
import { Header } from '#src/components/Header'
import theme, { darkTheme } from '#src/misc/theme'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Box, useMediaQuery } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { initGA } from 'green-analytics-js'
import { appWithTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { AppProps } from 'next/app'
import Script from 'next/script'
import { FC, useEffect, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import { SWRConfig } from 'swr'
import createEmotionCache from '#src/misc/createEmotionCache'
import { UserProvider } from '@auth0/nextjs-auth0/client'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const MyApp: FC<MyAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  useEffect(() => {
    try {
      initGA('0892f6c1-6c87-4d28-8df5-239da7d4d69c')
    } catch (err: any) {
      console.error('Failed to start green-analytics: ', err)
    }
  }, [])

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const selectedTheme = useMemo(
    () => (prefersDarkMode ? darkTheme : theme),
    [prefersDarkMode],
  )

  return (
    <CacheProvider value={emotionCache}>
      <NextSeo
        themeColor={selectedTheme.palette.primary.main}
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'initial-scale=1, width=device-width',
          },
        ]}
        additionalLinkTags={[
          {
            rel: 'apple-touch-icon',
            href: '/logo192.png',
            sizes: '192x192',
          },
          {
            rel: 'manifest',
            href: '/manifest.json',
          },
        ]}
        titleTemplate="%s | Nom-Nom"
      />
      <ThemeProvider theme={selectedTheme}>
        <UserProvider>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />

          <SWRConfig
            value={{
              errorRetryCount: 1, // only retry once, then throw error
              onErrorRetry: (error, key: string) => {
                const matches = /#url:"(\w*)"/g.exec(key)
                let formattedKey = key
                if (matches !== null && matches.length > 1) {
                  formattedKey = matches[1]
                }
                toast.error(
                  `${formattedKey} failed with error: ${
                    error?.response?.data?.message || error?.message || error
                  }`,
                )
              },
              revalidateOnFocus: false,
            }}
          >
            <Header />
            <Box sx={{ minHeight: 'calc(100vh - 72.5px)' }}>
              <Component {...pageProps} />
            </Box>
            <Footer />
            <Toaster
              richColors
              closeButton
              theme={prefersDarkMode ? 'dark' : 'light'}
            />
          </SWRConfig>
        </UserProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default appWithTranslation(MyApp)
