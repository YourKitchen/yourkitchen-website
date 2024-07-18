import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await handleGET(req, res)
  } else if (req.method === 'POST') {
    await handlePOST(req, res)
  } else {
    res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    })
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const take = req.query.take as string | undefined

  const cuisines = await prisma.cuisine.findMany({
    take: take ? Number.parseInt(take) : undefined,
  })

  res.json({ ok: true, message: 'Succesfully got cuisines', data: cuisines })
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create the cuisine. This requires that the user is an ADMIN or that they have a score of 25 or higher.
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({
      ok: false,
      message: 'You need to be logged in to create a cuisine',
    })
    return
  }

  const name = req.body.name as string

  if (!name) {
    res
      .status(400)
      .json({ ok: false, message: 'name is missing from the body' })
    return
  }

  let hasPermission = false
  if (session.user.role !== 'ADMIN') {
    hasPermission = true
  }

  if (!hasPermission) {
    const score = await prisma.rating.aggregate({
      _sum: {
        score: true,
      },
      where: {
        ownerId: session.user.id,
      },
    })

    if ((score._sum.score ?? 0) >= 25) {
      hasPermission = true
    }
  }

  if (hasPermission) {
    const response = await prisma.cuisine.create({
      data: {
        name,
      },
    })
    res.json({
      ok: true,
      message: 'Succesfully created cuisine',
      data: response,
    })
  } else {
    res
      .status(403)
      .json({ ok: false, message: 'You do not have a score of over 25' })
  }
}

export default handler
