const { i18n } = require('./next-i18next.config')

const advancedHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
]

const apiHeaders = [
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
  { key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
  { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
  {
    key: 'Access-Control-Allow-Headers',
    value:
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  },
]

/** @type {import('next').NextConfig} */
let config = {
  pageExtensions: ['ts', 'tsx'],
  transpilePackages: ['@mui/system', '@mui/material', '@mui/icons-material'],
  modularizeImports: {
    '@mui/material/?(((\\w*)?/?)*)': {
      transform: '@mui/material/{{ matches.[1] }}/{{member}}',
    },
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}',
    },
  },
  headers: async () => [
    {
      // Apply these headers to all routes in your application.
      source: '/:path*',
      headers: advancedHeaders,
    },
    {
      source: '/api/:path*',
      headers: apiHeaders,
    },
  ],
  i18n,
  images: {
    remotePatterns: [
      {
        hostname: 'flagcdn.com',
      },
      {
        hostname: '2n06sgsdn5gkizgn.public.blob.vercel-storage.com',
      },
      { hostname: 'play.google.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

if (process.env.ANALYZE?.toString() === 'true') {
  // @ts-ignore
  const withNextBundleAnalyzer = require('next-bundle-analyzer')()
  config = withNextBundleAnalyzer(config)
}

module.exports = config
