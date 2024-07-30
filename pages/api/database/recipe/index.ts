import {
  type MealType,
  Prisma,
  type Recipe,
  type RecipeImage,
} from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
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

  const query = req.query as {
    page?: string
    pageSize?: string
    mealType?: MealType
    cuisineName?: string
  }

  const page = Number.parseInt(query.page ?? '0')
  const pageSize = Number.parseInt(query.pageSize ?? '20')

  const [response, count] = await Promise.all([
    prisma.recipe.findMany({
      where: {
        cuisineName: query.cuisineName,
        mealType: query.mealType,
      },
      take: pageSize,
      skip: pageSize * page,
      include: {
        image: true,
        ratings: {
          select: {
            score: true,
          },
        },
      },
    }),
    prisma.recipe.count({
      where: {
        cuisineName: query.cuisineName,
        mealType: query.mealType,
      },
    }),
  ])

  return res.json({
    ok: true,
    message: 'Succesfully gotten the recipes',
    data: response,
    count,
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
  } = req.body as Omit<Recipe & { image: RecipeImage[] }, 'id'>

  const response = await prisma.recipe.create({
    data: {
      cuisineName,
      description,
      image: image
        ? {
            createMany: {
              data: image,
              skipDuplicates: true,
            },
          }
        : undefined,
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
