/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://yourkitchen.io',
  sourceDir: 'build',
  generateRobotsTxt: true,
}

module.exports = config
