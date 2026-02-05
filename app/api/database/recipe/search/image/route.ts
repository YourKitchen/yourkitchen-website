import type { NextRequest } from 'next/server'
import { getRecipeImage } from '#misc/recipeImage'
import { getQuery } from '#network/index'

export const GET = async (req: NextRequest) => {
  const { searchTerm } = getQuery<{ searchTerm: string }>(req)
  // Search for the term in the DB

  const response = await getRecipeImage(searchTerm, 4)

  return Response.json({
    ok: true,
    message: `Succesfully got recipes for search term: ${searchTerm}`,
    data: response,
  })
}
