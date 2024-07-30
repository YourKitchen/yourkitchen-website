import { Cuisine, MealType } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '#pages/api/_base'
import { getRecipeImage } from '#pages/api/_recipeImage'

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

  const response = await getRecipeImage(searchTerm, 4)

  res.json({
    ok: true,
    message: `Succesfully got recipes for search term: ${searchTerm}`,
    data: response,
  })
}

export default handler
