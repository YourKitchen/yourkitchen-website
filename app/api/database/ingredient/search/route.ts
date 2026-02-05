import type { NextRequest } from 'next/server'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = async (req: NextRequest) => {
  // Search for the term in the DB
  const query = getQuery<{ searchTerm: string; count?: string }>(req)
  const searchTerm = query.searchTerm
  const count = query.count ? Number.parseInt(query.count, 10) : 5

  const response = await prisma.ingredient.findMany({
    orderBy: {
      _relevance: {
        fields: 'name',
        search: searchTerm,
        sort: 'desc',
      },
    },
    take: Math.min(5, count), // Maximum is 5 to keep performance.
  })

  return Response.json({
    ok: true,
    message: `Succesfully got ingredients for search term: ${searchTerm}`,
    data: response,
  })
}
