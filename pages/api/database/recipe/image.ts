import { authOptions } from '#pages/api/auth/[...nextauth]'
import { put } from '@vercel/blob'
import type { NextApiRequest, NextApiResponse } from 'next'
import { type Session, getServerSession } from 'next-auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Get the user's own session,
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      res
        .status(401)
        .json({ ok: false, message: 'You need to be authenticated to do this' })
      return
    }

    if (req.method === 'POST') {
      await handlePOST(req, res, session)
    } else {
      res.status(405).json({ ok: false, message: 'Method not allowed' })
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message ?? err })
  }
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const recipeId = req.query.recipeId as string
  const id = req.query.id as string

  if (!recipeId) {
    res.status(400).json({
      ok: false,
      message: 'recipeId not provided',
    })
    return
  }
  if (!id) {
    res.status(400).json({
      ok: false,
      message: 'id not provided',
    })
    return
  }

  // The user is authenticated, so we can update the image for
  const userBlob = await put(`recipes/${recipeId}/${id}.jpg`, req, {
    access: 'public',
  })

  res.json({
    ok: true,
    message: 'Uploaded image succesfully',
    data: userBlob.url,
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler
