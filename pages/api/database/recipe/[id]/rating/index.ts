import prisma from '#pages/api/_base'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
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
  const ratings = await prisma.rating.findMany({
    where: {
      recipeId: req.query.id as string,
    },
  })

  return res.json({
    ok: true,
    message: 'Succesfully got rating',
    data: ratings,
  })
}

export default handler
