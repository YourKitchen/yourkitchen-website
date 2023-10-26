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

  res.json({
    ok: true,
    message: `Succesfully got cuisines for search term: ${searchTerm}`,
    data: response,
  })
}

export default handler
