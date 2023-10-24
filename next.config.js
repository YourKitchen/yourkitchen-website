// @ts-check

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

/** @type {import('next').NextConfig} */
let config = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  transpilePackages: ['@mui/system', '@mui/material', '@mui/icons-material'],
  modularizeImports: {
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
  ],
  i18n,
  images: {
    domains: ['flagcdn.com', 'play.google.com', 'lh3.googleusercontent.com'],
  },
}

if (process.env.ANALYZE?.toString() === 'true') {
  // @ts-ignore
  const withNextBundleAnalyzer = require('next-bundle-analyzer')()
  config = withNextBundleAnalyzer(config)
}

module.exports = config
