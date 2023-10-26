import { Recipe } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { ApiError } from 'next/dist/server/api-utils'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import prisma from '../../_base'

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

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res
      .status(401)
      .json({ ok: false, message: 'You need to be authenticated to do this' })
    return
  }

  const {
    cuisineName,
    description,
    image,
    mealType,
    name,
    persons,
    preparationTime,
    recipeType,
    steps,
  } = req.body as Omit<Recipe, 'id'>

  const response = await prisma.recipe.create({
    data: {
      cuisineName,
      description,
      image,
      mealType,
      name,
      persons,
      preparationTime,
      recipeType,
      steps,
      ownerId: session.user.id,
      created: new Date(),
    },
  })

  return res.json({
    ok: true,
    message: 'Succesfully created the recipe',
    data: response,
  })
}

export default handler
