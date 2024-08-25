import type { Recipe, RecipeImage } from '@prisma/client'
import type { GetServerSideProps } from 'next'
import type { NextRequest } from 'next/server'
import prisma from '#prisma'

const locales = ['da', 'en', 'de', 'es']
const SITE_URL = process.env.SITE_URL ?? 'https://yourkitchen.io'

function generateSiteMap(
  recipes: Pick<
    Recipe & { image: Pick<RecipeImage, 'link'>[] },
    'id' | 'updated' | 'image'
  >[],
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
   xmlns:xhtml="http://www.w3.org/1999/xhtml"
   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
     ${recipes
       .map((recipe) => {
         return `
       <url>
           <loc>${SITE_URL}/recipe/${recipe.id}</loc>
           ${locales.map(
             (locale) => `<xhtml:link
              rel="alternate"
              hreflang="${locale}"
              href="${SITE_URL}/${locale}/recipe/${recipe.id}"/>`,
           )}
           <lastmod>${recipe.updated.toISOString()}</lastmod>
           ${recipe.image.map(
             (image) => `<image:image>
              <image:loc>${image.link}</image:loc>
            </image:image>`,
           )}
       </url>
     `
       })
       .join('')}
   </urlset>
 `
}

export const GET = async (req: NextRequest) => {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      image: {
        select: {
          link: true,
        },
      },
      updated: true,
    },
  })

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(recipes)

  return new Response(sitemap, { headers: { 'Content-Type': 'text/xml' } })
}
