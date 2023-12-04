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
  const user = await prisma.user.findUnique({
    where: {
      id: req.query.id as string,
    },
    select: {
      id: true,
      feeditems: true,
      followers: true,
      following: true,
      image: true,
      name: true,
      ratings: true,
      recipes: true,
    },
  })
  if (!user) {
    res.status(404).json({ ok: false, message: 'Unable to find user' })
    return
  }

  return res.json({
    ok: true,
    message: 'Succesfully got user',
    data: user,
  })
}

export default handler
