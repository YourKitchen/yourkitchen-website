import { Box, CssBaseline } from '@mui/material'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import React, { Component, type FC, type PropsWithChildren } from 'react'
import { Toaster, toast } from 'sonner'
import { SWRConfig } from 'swr'
import Footer from '#components/Footer'
import Header from '#components/Header'
import theme from '#misc/theme'
import { api } from '#network/index'

const layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <CssVarsProvider defaultMode="system" theme={theme}>
      <CssBaseline />

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
        <Box sx={{ minHeight: 'calc(100vh - 72.5px)' }}>{children}</Box>
        <Footer />
        <Toaster richColors closeButton />
      </SWRConfig>
      <Toaster richColors closeButton theme={'system'} />
    </CssVarsProvider>
  )
}

export default layout
