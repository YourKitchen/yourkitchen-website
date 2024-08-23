import { useRouter as useNavigation } from 'next/navigation'
import React, { type FC, useEffect } from 'react'
import { toast } from 'sonner'
import { signOut } from '#misc/auth'

const SignoutPage: FC = async () => {
  await signOut({
    redirect: false,
    redirectTo: '/',
  })

  return <p>Signing out...</p>
}

export default SignoutPage
