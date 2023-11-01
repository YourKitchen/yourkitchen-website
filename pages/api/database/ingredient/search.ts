import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '#pages/api/_base'

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await handleGET(req, res)
  } else {
    res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    })
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  // Search for the term in the DB
  const searchTerm = req.query.searchTerm as string
  const count = req.query.count ? Number.parseInt(req.query.count as string) : 5

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

  res.json({
    ok: true,
    message: `Succesfully got ingredients for search term: ${searchTerm}`,
    data: response,
  })
}

export default handler
