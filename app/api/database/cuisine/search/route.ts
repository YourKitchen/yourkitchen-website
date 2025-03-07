import type { NextApiRequest, NextApiResponse } from 'next'
import { validatePermissions } from '#misc/utils'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = validatePermissions({ permissions: true }, async (req) => {
  // Search for the term in the DB
  const { searchTerm } = getQuery<{ searchTerm: string }>(req)

  const response = await prisma.cuisine.findMany({
    orderBy: {
      _relevance: {
        fields: 'name',
        search: searchTerm,
        sort: 'desc',
      },
    },
    take: 5,
  })

  return Response.json({
    ok: true,
    message: `Succesfully got cuisines for search term: ${searchTerm}`,
    data: response,
  })
})
