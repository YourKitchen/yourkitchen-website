import { CssBaseline } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import { Toaster } from 'sonner'
import theme from '#misc/theme'

export const RootLayout = ({
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
