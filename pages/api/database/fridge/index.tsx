import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { FridgeIngredient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'You need to be authenticated',
      })
      return
    }

    if (req.method === 'GET') {
      await handleGET(req, res, session)
    } else if (req.method === 'PUT') {
      await handlePUT(req, res, session)
    } else {
      res.status(405).json({
        ok: false,
        message: `Method ${req.method} is not allowed`,
      })
    }
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
  }
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
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

  res.json(response)
}

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
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
    res.status(404).json({
      ok: false,
      message: 'Unable to find fridge',
    })
    return
  }

  // When updating the fridge it is only the ingredients that will be updated.
  const upsert = req.body.upsert as FridgeIngredient[] | undefined
  const remove = req.body.remove as string[] | undefined

  if (!remove?.length && !upsert?.length) {
    res.status(400).json({
      ok: false,
      message: 'No updates provided',
    })
    return
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

  res.json(fridge)
}

export default handler
