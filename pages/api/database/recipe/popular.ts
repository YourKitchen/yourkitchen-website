import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '#pages/api/_base'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await handleGET(req, res)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message || err })
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
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

  res.json({
    ok: true,
    message: 'Successfully got recipes',
    data: recipes,
  })
}

export default handler
