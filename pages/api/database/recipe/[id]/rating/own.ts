import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { Rating } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      res.status(401).json({ ok: false, message: 'You need to be signed in' })
      return
    }

    if (req.method === 'GET') {
      await handleGET(req, res, session)
    } else if (req.method === 'PUT') {
      await handlePUT(req, res, session)
    } else {
      res.status(405).json({
        ok: false,
        message: 'Method not allowed',
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
  const rating = await prisma.rating.findFirst({
    where: {
      recipeId: req.query.id as string,
      ownerId: session.user.id,
    },
  })

  return res.json({
    ok: true,
    message: 'Succesfully got rating',
    data: rating,
  })
}

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const { score, message } = req.body as Partial<Rating>

  if (!score) {
    res.status(400).json({
      ok: false,
      message: 'score missing in request',
    })
    return
  }

  const rating = await prisma.rating.upsert({
    where: {
      recipeId_ownerId: {
        recipeId: req.query.id as string,
        ownerId: session.user.id,
      },
    },
    create: {
      score,
      message,
      recipeId: req.query.id as string,
      ownerId: session.user.id,
    },
    update: {
      score,
      message,
    },
  })

  return res.json({
    ok: true,
    message: 'Succesfully updated rating',
    data: rating,
  })
}

export default handler
