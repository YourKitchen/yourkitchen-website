import { signOut } from 'next-auth/react'
import { useRouter as useNavigation } from 'next/navigation'
import React, { type FC, useEffect } from 'react'
import { toast } from 'sonner'

const SignoutPage: FC = () => {
  const navigation = useNavigation()

  useEffect(() => {
    ;(async () => {
      try {
        const response = await signOut({
          redirect: false,
          callbackUrl: '/',
        })

        navigation.push(response.url)
      } catch (err) {
        toast.error(err.message || err)
      }
    })()
  }, [navigation])

  return <p>Signing out...</p>
}

export default SignoutPage
