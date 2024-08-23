import type { FridgeIngredient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest } from 'next/server'
import { validatePermissions } from '#misc/utils'
import { getBody } from '#network/index'
import prisma from '#prisma'

export const GET = validatePermissions(
  { permissions: true },
  async (req, session) => {
    // Get users own fridge
    const response = await prisma.fridge.upsert({
      where: {
        ownerId: session.user.id,
      },
      create: {
        ownerId: session.user.id,
      },
      update: {},
      include: {
        ingredients: true,
      },
    })

    return Response.json(response)
  },
)

export const PUT = validatePermissions(
  {
    permissions: true,
  },
  async (req, session) => {
    const fridge = await prisma.fridge.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    })

    if (!fridge) {
      return Response.json(
        {
          ok: false,
          message: 'Unable to find fridge',
        },
        {
          status: 404,
        },
      )
    }

    const body = await getBody<{
      upsert?: FridgeIngredient[]
      remove?: string[]
    }>(req)

    if (!body) {
      return Response.json(
        {
          ok: false,
          message: 'No body defined',
        },
        {
          status: 400,
        },
      )
    }

    // When updating the fridge it is only the ingredients that will be updated.
    const upsert = body.upsert
    const remove = body.remove

    if (!remove?.length && !upsert?.length) {
      return Response.json(
        {
          ok: false,
          message: 'No updates provided',
        },
        {
          status: 400,
        },
      )
    }

    if (remove?.length || upsert?.length) {
      // Remove all ingredient in both arrays. We will re-add the upsert ingredients
      await prisma.fridgeIngredient.deleteMany({
        where: {
          fridge: {
            ownerId: session.user.id,
          },
          ingredientId: {
            in: [
              ...(remove ?? []),
              ...(upsert?.map((ingredient) => ingredient.ingredientId) ?? []),
            ],
          },
        },
      })
      if (remove?.length) {
        fridge.ingredients = fridge.ingredients.filter((ingredient) =>
          remove.includes(ingredient.ingredientId),
        )
      }
    }
    if (upsert?.length) {
      // Some ingredients needs to be created
      const [ingredients] = await Promise.all([
        prisma.ingredient.findMany({
          where: {
            id: { in: upsert.map((ingredient) => ingredient.ingredientId) },
          },
        }),
        prisma.fridgeIngredient.createMany({
          data: upsert.map((ingredient) => ({
            ...ingredient,
            fridgeId: fridge.id,
          })),
        }),
      ])

      fridge.ingredients = fridge.ingredients.map((fridgeIngredient) => {
        const newValue = upsert.find(
          (newIngredient) =>
            newIngredient.ingredientId === fridgeIngredient.ingredientId,
        )

        // Find the ingredient that matches the upsert
        const ingredient = ingredients.find(
          (ingredient) => ingredient.id === fridgeIngredient.ingredientId,
        )

        if (!ingredient) {
          throw new Error(
            `Could not find ingredient with id ${fridgeIngredient.ingredientId}`,
          )
        }

        if (newValue) {
          return { ...newValue, ingredient }
        }

        return { ...fridgeIngredient, ingredient }
      })
    }

    return Response.json(fridge)
  },
)
