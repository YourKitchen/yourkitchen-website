/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  debug: false,
  i18n: {
    locales: ['default', 'en', 'da', 'de', 'es'],
    defaultLocale: 'default',
    localeDetection: false,
  },
  preload: false,
  trailingSlash: true,
  /** To avoid issues when deploying to some paas (vercel...) */
  localePath:
    typeof window === 'undefined'
      ? require('node:path').resolve('./public/locales')
      : '/locales',
}
