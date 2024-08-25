// TODO: Convert this to a fully server side component
import type { User } from '@prisma/client'
import type { GetServerSideProps } from 'next'
import type { NextRequest } from 'next/server'
import prisma from '#prisma'

const locales = ['da', 'en', 'de', 'es']
const SITE_URL = process.env.SITE_URL ?? 'https://yourkitchen.io'

function generateSiteMap(users: Pick<User, 'id' | 'image' | 'updated'>[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
   xmlns:xhtml="http://www.w3.org/1999/xhtml"
   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
     ${users
       .map((user) => {
         return `
       <url>
           <loc>${SITE_URL}/user/${user.id}</loc>
           ${locales.map(
             (locale) => `<xhtml:link
              rel="alternate"
              hreflang="${locale}"
              href="${SITE_URL}/${locale}/user/${user.id}"/>`,
           )}
           <lastmod>${user.updated.toISOString()}</lastmod>
           ${
             user.image
               ? `<image:image>
           <image:loc>${user.image}</image:loc>
         </image:image>`
               : ''
           }
       </url>
     `
       })
       .join('')}
   </urlset>
 `
}

export const GET = async (req: NextRequest) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      image: true,
      updated: true,
    },
  })

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(users)

  return new Response(sitemap, { headers: { 'Content-Type': 'text/xml' } })
}
