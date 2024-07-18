import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'
import { type Session, getServerSession } from 'next-auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    if (req.method === 'PUT') {
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

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const id = req.query.id as string

  const exists = await prisma.follows.findFirst({
    where: {
      followerId: session.user.id,
      followingId: id,
    },
  })

  if (exists) {
    // If the value exists, delete it
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: id,
        },
      },
    })
    res.json({
      ok: true,
      message: 'Succesfully updated following state',
      data: false,
    })
  } else {
    // Create it
    await prisma.follows.create({
      data: {
        followerId: session.user.id,
        followingId: id,
      },
    })
    res.json({
      ok: true,
      message: 'Succesfully updated following state',
      data: true,
    })
  }
}

export default handler
