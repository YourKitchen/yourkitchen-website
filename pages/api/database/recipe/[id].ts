import { Recipe, RecipeImage } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await handleGET(req, res)
  } else if (req.method === 'DELETE') {
    await handleDELETE(req, res)
  } else if (req.method === 'PUT') {
    await handlePUT(req, res)
  } else {
    res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    })
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const recipe = await prisma.recipe.findUnique({
    where: {
      id: req.query.id as string,
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
  })
  if (!recipe) {
    res.status(404).json({ ok: false, message: 'Unable to find recipe' })
    return
  }

  return res.json({
    ok: true,
    message: 'Succesfully got recipe',
    data: recipe,
  })
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ ok: false, message: 'You need to be signed in' })
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
  } = req.body as Partial<Recipe & { image: RecipeImage[] }>

  const recipe = await prisma.recipe.update({
    where: {
      id: req.query.id as string,
      ownerId: session.user.id,
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

  return res.json({
    ok: true,
    message: 'Succesfully updated recipe',
    data: recipe,
  })
}

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ ok: false, message: 'You need to be signed in' })
    return
  }

  const recipe = await prisma.recipe.delete({
    where: {
      id: req.query.id as string,
      ownerId: session.user.id,
    },
  })

  return res.json({
    ok: true,
    message: 'Succesfully updated recipe',
    data: recipe,
  })
}

export default handler
