import { Ingredient, Recipe } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { ApiError } from 'next/dist/server/api-utils'
import { getIngredientId } from 'src/utils'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import prisma from '../../_base'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    await handlePOST(req, res)
  } else {
    res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    })
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res
      .status(401)
      .json({ ok: false, message: 'You need to be authenticated to do this' })
    return
  }
  if (session.user.role !== 'ADMIN' && session.user.score < 5) {
    res
      .status(401)
      .json({ ok: false, message: 'You need a score of at least 5' })
    return
  }

  const { name, allergenTypes } = req.body as Ingredient

  const response = await prisma.ingredient.create({
    data: {
      id: getIngredientId(name),
      name,
      allergenTypes,
    },
  })

  return res.json({
    ok: true,
    message: 'Succesfully created the recipe',
    data: response,
  })
}

export default handler
