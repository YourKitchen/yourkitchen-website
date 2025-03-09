import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import InitColorSchemeScript from '@mui/system/InitColorSchemeScript'
import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next';

// If loading a variable font, you don't need to specify the font weight
const baloo = Baloo_2({
  weight: '600',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s - YourKitchen',
    default: 'YourKitchen',
  },
}

const RootLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <AppRouterCacheProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={baloo.className}>
          <InitColorSchemeScript attribute="class" />
          {children}
          <Analytics/>
        </body>
      </html>
    </AppRouterCacheProvider>
  )
}
export default RootLayout
