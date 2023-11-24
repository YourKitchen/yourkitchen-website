import { red } from '@mui/material/colors'
import { ThemeOptions, createTheme } from '@mui/material/styles'
import { Cabin } from 'next/font/google'

export const roboto = Cabin({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const defaultThemeOptions: ThemeOptions = {
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          background: 'radial-gradient(circle at top, #fde2c6 , #fdfdfd)',
        },
        ':root': {
          colorScheme: 'light',
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
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          // Controls default (unchecked) color for the thumb
          color: '#ccc',
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
        },
      },
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
}

// Create a theme instance.
export const theme = createTheme(defaultThemeOptions)

export const darkTheme = createTheme({
  ...defaultThemeOptions,
  palette: {
    ...defaultThemeOptions.palette,
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
  components: {
    ...defaultThemeOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          background: 'radial-gradient(circle at top, #221102 , #070a1f)',
        },
        ':root': {
          colorScheme: 'dark',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          backgroundColor: '#333 !important',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          backgroundColor: '#000',
          // Controls default (unchecked) color for the thumb
          color: '#333',
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
          backgroundColor: '#000',
          '.Mui-checked.Mui-checked + &': {
            // Controls checked color for the track
            opacity: 0.7,
            backgroundColor: '#000',
          },
        },
      },
    },
  },
})

export default theme
