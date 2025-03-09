import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'
import { Baloo_2 } from 'next/font/google'
import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import { type ForwardedRef, forwardRef } from 'react'

const LinkBehaviour = forwardRef(
  (props: LinkProps, ref: ForwardedRef<HTMLAnchorElement>) => {
    return <NextLink ref={ref} {...props} />
  },
)

const baloo = Baloo_2({
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
})

// Create a theme instance.
export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#f3b03d',
        },
        secondary: {
          main: '#3d80f3',
        },
        error: {
          main: red.A400,
        },
        background: {
          default: '#eeeeee',
          paper: '#fdfdfd',
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#f3b03d',
        },
        secondary: {
          main: '#3d80f3',
        },
        background: {
          default: '#121212',
          paper: '#222222',
        },
      },
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehaviour,
      },
      styleOverrides: {
        root: {
          textDecoration: 'none',
          color: 'var(--mui-palette-text-primary)',
          ':active': {
            color: 'inherit',
          },
          ':hover': {
            color: 'inherit',
          },
          ':visited': {
            color: 'inherit',
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehaviour,
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          background: 'radial-gradient(circle at top, #fde2c6 , #fdfdfd)',
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          color: '#000',

          ...theme.applyStyles('dark', {
            color: '#fff',
            background: 'radial-gradient(circle at top, #221102 , #070a1f)',
          }),
        },
      }),
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '13px',
          padding: '8px 16px',
        },
      },
    },
  },
  typography: {
    allVariants: {
      ...baloo.style,
      fontWeight: '600',
    },
    body1: {
      ...baloo.style,
      fontWeight: '400',
    },
  },
})

export default theme
