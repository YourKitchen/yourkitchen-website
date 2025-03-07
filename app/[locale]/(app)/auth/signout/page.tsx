import { signOut } from '#misc/auth'
import type { FC } from 'react'

const SignoutPage: FC = async () => {
  await signOut({
    redirect: false,
    redirectTo: '/',
  })

  return <p>Signing out...</p>
}

export default SignoutPage
