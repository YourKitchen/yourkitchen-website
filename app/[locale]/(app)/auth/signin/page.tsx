import { Box, Typography } from '@mui/material'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { FC } from 'react'
import { auth } from '#misc/auth'
import Providers from '../../../../../src/components/Auth/Providers'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to access additional features of YourKitchen sucha as a personalized mealplan',
}

const SigninPage: FC<{
  searchParams: Promise<{ callbackUrl: string }>
}> = async ({ searchParams }) => {
  // Translations
  const t = await getTranslations('auth')

  const session = await auth()

  const params = await searchParams

  if (session) {
    redirect(params.callbackUrl || '/')
  }

  // useEffect(() => {
  //   const error = searchParams.get('error')
  //   if (error) {
  //     let errorMessage: string | undefined = undefined

  //     switch (error) {
  //       case 'OAuthAccountNotLinked':
  //         errorMessage = 'Another sign in provider was used for this email'
  //         break
  //       case 'SessionRequired':
  //         errorMessage = 'You need to be logged in to access this page'
  //         break
  //       default:
  //         errorMessage = error
  //         break
  //     }

  //     if (errorMessage) {
  //       toast.error(`${error}: ${errorMessage}`, {
  //         duration: 10000,
  //       })
  //     }
  //   }
  // }, [searchParams])

  // const submit = async () => {
  //   try {
  //     // Send the credentials to the backend using the signIn method from next-auth
  //     const response = await signIn('email', {
  //       email,
  //       redirect: false,
  //       callbackUrl: searchParams.get('callbackUrl') || '/',
  //     })

  //     if (response?.error) {
  //       toast.error(response.error)
  //       return
  //     }
  //     if (response?.ok) {
  //       console.log(response)
  //       toast.success('Check your email for a magic link!')
  //     }
  //   } catch (err) {
  //     toast.error(err.message || err)
  //   }
  // }

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
      <Box
        sx={{
          width: { sm: '100%', md: '350px' },
          backgroundColor: 'var(--mui-palette-background-paper)',
          borderRadius: 2,
          textAlign: 'center',
          padding: 2,
          paddingBottom: 4,
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
        {/* <TextField
          name="email"
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
        </Typography> */}
        <Providers />
      </Box>
    </Box>
  )
}

export default SigninPage
