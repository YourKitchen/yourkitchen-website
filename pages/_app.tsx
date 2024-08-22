import { CacheProvider, type EmotionCache } from '@emotion/react'
import { Box, Experimental_CssVarsProvider, useMediaQuery } from '@mui/material'
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { initGA } from 'green-analytics-js'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import type { AppProps } from 'next/app'
import { type FC, useEffect, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import { SWRConfig } from 'swr'
import AnalyticsWrapper from '#components/AnalyticsWrapper'
import { Footer } from '#components/Footer'
import { Header } from '#components/Header'
import theme from '#misc/theme'
import { api } from '#network/index'

// Client-side cache, shared for the whole session of the user in the browser.
export interface MyAppProps extends AppProps {
  session?: Session
}

const MyApp: FC<MyAppProps> = (props) => {
  const { Component, pageProps } = props

  useEffect(() => {
    try {
      initGA('731cf069-65d8-4fc2-9a6e-82ca3fbc87ae')
    } catch (err: any) {
      console.error('Failed to start green-analytics: ', err)
    }
  }, [])

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <AppCacheProvider {...props}>
      <NextSeo
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
        titleTemplate="%s | YourKitchen"
        defaultTitle="YourKitchen"
      />
      <Experimental_CssVarsProvider theme={theme} defaultMode="system">
        <SessionProvider session={pageProps.session}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline enableColorScheme />

          <SWRConfig
            value={{
              fetcher: async (args) => {
                if (typeof args === 'string') {
                  const response = await api.get(`/database/${args}`)
                  return response.data
                }
                const { url, ...rest } = args

                const response = await api.get(`/database/${url}`, {
                  params: rest,
                })
                return response.data
              },
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
              <AnalyticsWrapper>
                <Component {...pageProps} />
              </AnalyticsWrapper>
            </Box>
            <Footer />
            <Toaster
              richColors
              closeButton
              theme={prefersDarkMode ? 'dark' : 'light'}
            />
          </SWRConfig>
        </SessionProvider>
      </Experimental_CssVarsProvider>
    </AppCacheProvider>
  )
}

export default appWithTranslation(MyApp)
