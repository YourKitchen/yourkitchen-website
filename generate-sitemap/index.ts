import { generateSitemap } from 'react-sitemap-generator'
import axios from 'axios'
import MainRoutes from './Routes/MainRoutes'
import PolicyRoutes from './Routes/PolicyRoutes'
;(async () => {
  // Get recipe IDs
  const response = await axios.post('https://api.yourkitchen.io/graphql', {
    query: `
  query {
    recipeFindMany {
      _id
    }
  }`,
  })

  const recipeIDs = (
    response.data.data?.recipeFindMany as {
      _id: string
    }[]
  ).map((value) => value._id)

  generateSitemap({
    url: 'https://yourkitchen.io',
    output: '../public',
    routes: [MainRoutes, PolicyRoutes],
    options: {
      '/dashboard/*': { ignore: true },
      '/policies/*': { ignore: true },
      '/recipe/:id': { slugs: { id: recipeIDs } },
    },
  })
})()
