import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - YourKitchen',
    default: 'YourKitchen',
  },
}

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <AppRouterCacheProvider>
      <html lang="en">
        <body
          style={{ backgroundColor: 'var(--mui-palette-background-paper)' }}
        >
          {children}
        </body>
      </html>
    </AppRouterCacheProvider>
  )
}
export default RootLayout
