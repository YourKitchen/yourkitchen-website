import {
  type MealType,
  Prisma,
  type Recipe,
  type RecipeImage,
} from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import { validatePermissions } from '#misc/utils'
import { getBody, getQuery } from '#network/index'
import prisma from '../../../../src/misc/prisma'

export const GET = async (req: NextRequest) => {
  // Get all recipes. This uses pagination, to limit the amount of recipes gotten.
  const query = getQuery<{
    page?: string
    pageSize?: string
    mealType?: MealType
    cuisineName?: string
  }>(req)

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

  return Response.json({
    ok: true,
    message: 'Succesfully gotten the recipes',
    data: response,
    count,
  })
}

export const POST = validatePermissions(
  {
    permissions: true,
  },
  async (req, user) => {
    const body = await getBody(req)

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
    } = body as Omit<Recipe & { image: RecipeImage[] }, 'id'>

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
        ownerId: user.id,
        created: new Date(),
      },
    })

    return Response.json({
      ok: true,
      message: 'Succesfully created the recipe',
      data: response,
    })
  },
)
