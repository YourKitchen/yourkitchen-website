'use client'
import { CircularProgress, CssBaseline, ThemeProvider } from '@mui/material'
import { type FC, type PropsWithChildren, Suspense } from 'react'
import { Toaster, toast } from 'sonner'
import { SWRConfig } from 'swr'
import theme from '#misc/theme'
import { api } from '#network/index'

const layout: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <ThemeProvider theme={theme}>
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
        <Suspense fallback={<CircularProgress />}>{children}</Suspense>
        <Toaster richColors closeButton />
      </SWRConfig>
      <Toaster richColors closeButton theme={'system'} />
    </ThemeProvider>
  )
}

export default layout
