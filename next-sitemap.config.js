/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://yourkitchen.io',
  generateRobotsTxt: true,
}

module.exports = config
