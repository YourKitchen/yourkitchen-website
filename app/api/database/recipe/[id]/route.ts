import type { Recipe, RecipeImage } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { validatePermissions } from '#misc/utils'
import { getBody, getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  const params = await ctx.params

  if (!params.id) {
    return Response.json(
      {
        ok: false,
        message: 'Id not provided',
      },
      {
        status: 400,
      },
    )
  }

  const [recipe, rating] = await Promise.all([
    prisma.recipe.findFirst({
      where: {
        id: params.id,
      },
      include: {
        image: true,
        ingredients: {
          select: {
            amount: true,
            unit: true,
            ingredient: true,
          },
        },
        owner: true,
        ratings: true,
      },
    }),
    prisma.rating.aggregate({
      where: {
        recipeId: params.id as string,
      },
      _avg: {
        score: true,
      },
    }),
  ])
  if (!recipe) {
    return Response.json(
      { ok: false, message: 'Unable to find recipe' },
      { status: 404 },
    )
  }

  return Response.json({
    ok: true,
    message: 'Succesfully got recipe',
    data: {
      ...recipe,
      rating: rating._avg.score ?? 0,
    },
  })
}

export const PUT = validatePermissions(
  {
    permissions: true,
  },
  async (req, user, ctx) => {
    const params = await ctx.params

    if (!params.id) {
      return Response.json(
        {
          ok: false,
          message: 'Id not provided',
        },
        {
          status: 400,
        },
      )
    }
    const body = getBody<Partial<Recipe & { image: RecipeImage[] }>>(req)

    if (!body) {
      return Response.json(
        {
          ok: false,
          message: 'Body not provided',
        },
        {
          status: 400,
        },
      )
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
    } = body as Partial<Recipe & { image: RecipeImage[] }>

    const recipe = await prisma.recipe.update({
      where: {
        id: params.id as string,
        ownerId: user.id,
      },
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
      },
    })

    return Response.json({
      ok: true,
      message: 'Succesfully updated recipe',
      data: recipe,
    })
  },
)

export const DELETE = validatePermissions(
  {
    permissions: true,
  },
  async (req, user, ctx) => {
    const params = await ctx.params

    if (!params.id) {
      return Response.json(
        {
          ok: false,
          message: 'Id not provided',
        },
        {
          status: 400,
        },
      )
    }

    const recipe = await prisma.recipe.delete({
      where: {
        id: params.id as string,
        ownerId: user.id,
      },
    })

    return Response.json({
      ok: true,
      message: 'Succesfully updated recipe',
      data: recipe,
    })
  },
)
