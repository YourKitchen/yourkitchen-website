import { DateTime } from 'luxon'
import type { NextRequest } from 'next/server'
import prisma from '#prisma'

export const GET = async (_req: NextRequest) => {
  // Get the 20 most popular recipes within the last week.
  const ratings = await prisma.rating.findMany({
    distinct: 'recipeId',
    orderBy: {
      score: 'desc',
    },
    where: {
      created: {
        gte: DateTime.utc().minus({ week: 1 }).toJSDate(),
      },
      recipe: {
        isNot: null,
      },
    },
    take: 20,
  })

  const recipeIds = ratings.map((rating) => rating.recipeId ?? '')

  const recipes = await prisma.recipe.findMany({
    where: {
      id: {
        in: recipeIds,
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
  })

  // If length is less than 20, fill the rest with random recipes.
  if (recipes.length < 20) {
    const diff = 20 - recipes.length

    const additionalRecipes = await prisma.recipe.findMany({
      take: diff,
      include: {
        image: true,
        ratings: {
          select: {
            score: true,
          },
        },
      },
      orderBy: {
        created: 'desc',
      },
    })

    recipes.push(...additionalRecipes)
  }

  return Response.json({
    ok: true,
    message: 'Successfully got recipes',
    data: recipes,
  })
}
