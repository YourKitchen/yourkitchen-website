import { put } from '@vercel/blob'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Session } from 'next-auth'
import { validatePermissions } from '#misc/utils'

export const POST = validatePermissions(
  {
    permissions: true,
  },
  async (req, session) => {
    const blob = await req.blob()
    // The user is authenticated, so we can update the image for
    const userBlob = await put(`users/${session.user.id}.jpg`, blob, {
      access: 'public',
    })

    return Response.json({
      ok: true,
      message: 'Uploaded image succesfully',
      data: userBlob.url,
    })
  },
)

export const config = {
  api: {
    bodyParser: false,
  },
}
