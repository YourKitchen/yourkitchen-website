const locales = ['en', 'da', 'de', 'es']
const siteUrl = process.env.SITE_URL || 'https://yourkitchen.io'

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: [
    ...locales.map((locale) => `*/${locale}/*`),
    ...locales.map((locale) => `*/${locale}`),
  ],
  alternateRefs: locales.map((locale) => ({
    href: `${siteUrl}/${locale}`,
    hreflang: locale,
  })),
}

module.exports = config
