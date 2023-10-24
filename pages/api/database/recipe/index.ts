import prisma from '#lib/prisma'
import { Recipe } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await handleGET(req, res)
  } else if (req.method === 'POST') {
    await handlePOST(req, res)
  } else {
    res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    })
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get all recipes. This uses pagination, to limit the amount of recipes gotten.

  const { page, pageSize } = req.query as { page: string; pageSize: string }

  if (!page) {
    throw new ApiError(400, 'page is not defined')
  }
  if (!pageSize) {
    throw new ApiError(400, 'pageSize is not defined')
  }

  const response = await prisma.recipe.findMany({
    take: Number.parseInt(pageSize),
    skip: Number.parseInt(pageSize) * Number.parseInt(page),
    include: {
      _count: true,
    },
  })
  console.log(response)
  return res.json({
    ok: true,
    message: 'Succesfully gotten the recipes',
    data: response,
    // TODO: Add count
  })
}

const handlePOST = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const recipe = req.body as Omit<Recipe, 'id'>

    const response = await prisma.recipe.create({
      data: recipe,
    })

    return res.json({
      ok: true,
      message: 'Succesfully created the recipe',
      data: response,
    })
  },
)

export default handler
