import type { NextAuthConfig } from 'next-auth'
import type { Provider } from 'next-auth/providers'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'

const providers: Provider[] = [
  // TODO: Look into reimplementation when it is available in edge.
  // NodemailerProvider({
  //   from: `YourKitchen <${process.env.GMAIL_FROM}>`,
  //   server: {
  //     host: 'smtp.gmail.com',
  //     port: 465,
  //     secure: true,
  //     auth: {
  //       type: 'OAuth2',
  //       user: process.env.GMAIL_FROM, // Your email address
  //       serviceClient: process.env.GMAIL_CLIENT_ID,
  //       privateKey: process.env.GMAIL_PRIVATE_KEY,
  //       accessUrl: process.env.GMAIL_TOKEN_URL,
  //     },
  //   },
  // }),
  GoogleProvider({
    clientId: process.env.GOOGLE_AUTH_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET ?? '',
  }),
  FacebookProvider({
    clientId: process.env.FACEBOOK_AUTH_CLIENT_ID ?? '',
    clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET ?? '',
  }),
]

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider()
    return {
      id: providerData.id,
      type: providerData.type,
      name: providerData.name,
    }
  }
  return { id: provider.id, type: provider.type, name: provider.name }
})

// Notice this is only an object, not a full Auth.js instance
export default {
  providers,
} satisfies NextAuthConfig
