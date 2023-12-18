import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { updateMealplan } from '#utils/meaplanHelper'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

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
  session: Session | null,
) => {
  const id = req.query.id as string

  if (!id) {
    res.status(400).json({
      ok: false,
      message: 'id is missing for this endpoint',
    })
    return
  }

  // Get the user's meal plan.
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id,
      OR: [
        {
          public: true,
        },
        {
          ownerId: session?.user.id,
        },
      ],
    },
    include: {
      owner: true,
      recipes: {
        include: {
          recipe: {
            include: {
              image: true,
              owner: true,
              ratings: true,
            },
          },
        },
      },
    },
  })

  const weekDate = DateTime.fromISO((req.query.weekDate ?? '') as string) // Empty will cause invalid DateTime. This is checked below

  if (mealPlan) {
    const response = await updateMealplan(
      mealPlan,
      mealPlan.owner,
      weekDate.isValid ? weekDate : undefined,
    )

    res.json(response)
  } else {
    res.json(null)
  }
}

export default handler
