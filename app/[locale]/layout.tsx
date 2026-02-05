import { Box } from '@mui/system'
import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { FC, PropsWithChildren } from 'react'
import Footer from '#components/Footer'
import Header from '#components/Header'
import { auth } from '#misc/auth'

const layout: FC<
  PropsWithChildren & { params: Promise<{ locale?: string }> }
> = async ({ children, params }) => {
  const { locale } = await params

  const messages = await getMessages({ locale: locale })
  const session = await auth()

  return (
    <NextIntlClientProvider locale={locale ?? 'en'} messages={messages}>
      <SessionProvider session={session}>
        <Header />
        <Box sx={{ minHeight: 'calc(100vh - 72.5px)' }}>{children}</Box>
        <Footer locale={locale ?? 'en'} />
      </SessionProvider>
    </NextIntlClientProvider>
  )
}

export default layout
