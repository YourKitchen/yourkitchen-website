'use server'
import { Button } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import { signIn } from '#misc/auth'

const providerMap = [
  {
    id: 'google',
    name: 'Google',
  },
  {
    id: 'facebook',
    name: 'Facebook',
  },
]

const Providers = async () => {
  return providerMap.map((provider) => (
    <form
      key={`${provider.id}-form`}
      action={async () => {
        'use server'
        signIn(provider.id, { callbackUrl: '/' })
      }}
    >
      <Button
        type="submit"
        sx={{
          fontWeight: 'normal',
          marginTop: 2,
          '&:hover': {
            textDecoration: 'none',
            backgroundColor:
              'rgba(var(--mui-palette-primary-light) / var(--mui-palette-action-hoverOpacity))',
            color: 'white',
          },
          justifyContent: 'left',
          width: '100%',
          gap: 2,
          backgroundColor:
            'rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))',
        }}
      >
        <Image
          alt={`${provider.name} sign in option`}
          src={`https://authjs.dev/img/providers/${provider.id}.svg`}
          width={25}
          height={25}
        />
        Sign in with {provider.name}
      </Button>
    </form>
  ))
}

export default Providers
