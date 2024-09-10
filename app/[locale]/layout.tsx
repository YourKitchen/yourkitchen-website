import { Box, ThemeProvider } from '@mui/system'
import { SessionProvider, useSession } from 'next-auth/react'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server'
import React, { type FC, type PropsWithChildren, Suspense } from 'react'
import Footer from '#components/Footer'
import Header from '#components/Header'
import { auth } from '#misc/auth'
import theme from '#misc/theme'
import { CssBaseline } from '@mui/material'

const layout: FC<PropsWithChildren & { params: { locale?: string } }> = async ({
  children,
  params,
}) => {
  const messages = await getMessages({ locale: params.locale })
  const session = await auth()

  return (
    <NextIntlClientProvider locale={params.locale ?? 'en'} messages={messages}>
      <SessionProvider session={session}>
        <Header />
        <Box sx={{ minHeight: 'calc(100vh - 72.5px)' }}>{children}</Box>
        <Footer locale={params.locale ?? 'en'} />
      </SessionProvider>
    </NextIntlClientProvider>
  )
}

export default layout