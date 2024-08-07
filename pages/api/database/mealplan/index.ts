import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'
import { type Session, getServerSession } from 'next-auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({
      ok: false,
      message: 'Unauthenticated',
    })
    return
  }

  try {
    if (req.method === 'GET') {
      await handleGET(req, res, session)
    } else {
      res.status
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
  // Get the user's meal plan.
  const response = await prisma.mealPlan.findMany({
    where: {
      public: true,
      owner: {
        followers: {
          some: {
            // If we are following the owner, show their meal plan
            followerId: session.user.id,
          },
        },
      },
    },
    include: {
      owner: true,
    },
  })

  res.json(response)
}

export default handler
