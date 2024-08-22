import { red } from '@mui/material/colors'
import {
  type CssVarsThemeOptions,
  type ThemeOptions,
  createTheme,
  experimental_extendTheme,
} from '@mui/material/styles'
import { Cabin } from 'next/font/google'
import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import { type FC, forwardRef } from 'react'

export const roboto = Cabin({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const LinkBehaviour: FC<LinkProps> = (props) => {
  return <NextLink {...props} />
}

const defaultThemeOptions: CssVarsThemeOptions = {
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
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehaviour,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at top, #fde2c6 , #fdfdfd)',
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          color: '#000',

          '[data-mui-color-scheme="dark"] &': {
            color: '#fff',
            background: 'radial-gradient(circle at top, #221102 , #070a1f)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '13px',
          padding: '8px 16px',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '[data-mui-color-scheme="dark"] &': {
            backgroundColor: '#333 !important',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          // Controls default (unchecked) color for the thumb
          color: '#ccc',

          '[data-mui-color-scheme="dark"] &': {
            backgroundColor: '#000',
            color: '#333',
          },
        },
        colorPrimary: (props) => ({
          '&.Mui-checked': {
            // Controls checked color for the thumb
            color: props.theme.palette.secondary.main,
          },
        }),
        track: {
          // Controls default (unchecked) color for the track
          opacity: 0.2,
          backgroundColor: '#fff',
          '.Mui-checked.Mui-checked + &': {
            // Controls checked color for the track
            opacity: 0.7,
            backgroundColor: '#fff',
          },

          '[data-mui-color-scheme="dark"] &': {
            backgroundColor: '#000',
            '.Mui-checked.Mui-checked + &': {
              // Controls checked color for the track
              backgroundColor: '#000',
            },
          },
        },
      },
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
}

// Create a theme instance.
export const theme = experimental_extendTheme(defaultThemeOptions)

export default theme
