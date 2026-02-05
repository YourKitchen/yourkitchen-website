import type { NextRequest } from 'next/server'
import type { Cuisine, MealType } from 'prisma/generated/prisma/client'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = async (req: NextRequest) => {
  const query = getQuery<{
    searchTerm: string
    mealType?: MealType
    cuisine?: Cuisine['name']
    maxPrepTime?: number
  }>(req)
  // Search for the term in the DB
  const searchTerm = query.searchTerm

  const mealType = query.mealType
  const cuisine = query.cuisine
  const maxPrepTime = query.maxPrepTime

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
        search: searchTerm,
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

  return Response.json({
    ok: true,
    message: `Succesfully got recipes for search term: ${searchTerm}`,
    data: response,
  })
}
