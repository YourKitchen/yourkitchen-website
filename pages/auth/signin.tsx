import {
  Facebook,
  Google,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Box } from '@mui/material'
import { GetStaticProps } from 'next'
import { signIn, useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter as useNavigation, useSearchParams } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'

export const SigninPage: FC = () => {
  // States
  const [email, setEmail] = useState('')

  // Translation
  const { t } = useTranslation('auth')

  // Verification
  const { status } = useSession()
  const navigation = useNavigation()
  const searchParams = useSearchParams()

  if (status === 'authenticated') {
    navigation.push('/')
  }

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      let errorMessage: string | undefined = undefined

      switch (error) {
        case 'OAuthAccountNotLinked':
          errorMessage = 'Another sign in provider was used for this email'
          break
        default:
          errorMessage = error
          break
      }

      if (errorMessage) {
        toast.error(`${error}: ${errorMessage}`, {
          duration: 10000,
        })
      }
    }
  }, [searchParams])

  const submit = async () => {
    try {
      // Send the credentials to the backend using the signIn method from next-auth
      const response = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: searchParams.get('callbackUrl') || '/',
      })

      if (response?.error) {
        toast.error(response.error)
        return
      } else if (response?.ok) {
        toast.success('Check your email for a magic link!')
      }
    } catch (err) {
      toast.error(err.message || err)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '350px' },
            height: { sm: '100%', md: '400px' },
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: 2,
            textAlign: 'center',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
            }}
          >
            {t('login')}
          </Typography>
          <TextField
            value={email}
            onChange={(event): void => {
              setEmail(event.target.value)
            }}
            type="email"
            margin="dense"
            id={'email'}
            label={t('email')}
            fullWidth
            variant="outlined"
            autoComplete="email"
          />
          <Button
            sx={{
              marginTop: 'auto',
            }}
            variant="contained"
            type="submit"
          >
            {t('send_link')}
          </Button>
          <Typography variant="subtitle1" sx={{ my: 2 }}>
            {t('OR')}
          </Typography>
          <Button
            onClick={async () => {
              await signIn('google', {
                redirect: false,
                callbackUrl: searchParams.get('callbackUrl') || '/',
              })
            }}
            sx={{
              height: '50px',
              color: (theme) => theme.palette.text.primary,
              backgroundColor: (theme) => theme.palette.background.default,
              p: 1,
              textDecoration: 'none',
              justifyContent: 'left',
              gap: 1,
            }}
          >
            <Google />
            Google
          </Button>
          <Button
            onClick={async () => {
              await signIn('facebook', {
                redirect: false,
                callbackUrl: searchParams.get('callbackUrl') || '/',
              })
            }}
            sx={{
              height: '50px',
              color: (theme) => theme.palette.text.primary,
              backgroundColor: (theme) => theme.palette.background.default,
              mt: 1,
              p: 1,
              textDecoration: 'none',
              justifyContent: 'left',
              gap: 1,
            }}
          >
            <Facebook />
            Facebook
          </Button>
          {/* <Button
            onClick={async () => {
              await signIn('apple', {
                redirect: false,
                callbackUrl: searchParams.get('callbackUrl') || '/',
              })
            }}
            sx={{ mt: 1, p: 1, textDecoration: 'none' }}
          >
            <Apple/>
            Apple
          </Button> */}
        </Box>
      </form>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: locale
      ? {
          ...(await serverSideTranslations(locale, [
            'auth',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {},
  }
}

export default SigninPage
