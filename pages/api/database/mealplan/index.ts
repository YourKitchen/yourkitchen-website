import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

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
      OR: [
        {
          // If we are a follower of the meal plan
          followers: {
            some: {
              id: session.user.id,
            },
          },
          public: true,
        },
      ],
    },
    include: {
      owner: true,
    },
  })

  res.json(response)
}

export default handler
