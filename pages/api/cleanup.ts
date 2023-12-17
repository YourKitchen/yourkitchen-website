import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from './_base'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // VALIDATE CRON SECRET
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).end('Unauthorized')
    }

    if (req.method === 'GET') {
      await handleGET(req, res)
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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  // Remove meal plan recipes that are older than 2 weeks ago
  await prisma.mealPlanRecipe.deleteMany({
    where: {
      date: {
        lte: DateTime.utc()
          .minus({
            week: 2,
          })
          .startOf('day')
          .toJSDate(),
      },
    },
  })

  res.json({
    ok: true,
    message: 'Cleanup succesful',
  })
}

export default handler
