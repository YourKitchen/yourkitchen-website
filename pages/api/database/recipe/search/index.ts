import prisma from '#pages/api/_base'
import type { Cuisine, MealType } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

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

  const mealType = req.query.mealType as MealType | undefined
  const cuisine = req.query.cuisine as Cuisine['name'] | undefined
  const maxPrepTime = req.query.maxPrepTime as number | undefined

  const response = await prisma.recipe.findMany({
    where: {
      mealType,
      cuisineName: cuisine,
      preparationTime: maxPrepTime
        ? {
            lte: maxPrepTime,
          }
        : undefined,
    },
    orderBy: {
      _relevance: {
        fields: 'name',
        search: searchTerm.split(' ').join(' & '),
        sort: 'desc',
      },
    },
    include: {
      image: true,
      ratings: {
        select: {
          score: true,
        },
      },
    },
    take: 8,
  })

  res.json({
    ok: true,
    message: `Succesfully got recipes for search term: ${searchTerm}`,
    data: response,
  })
}

export default handler
