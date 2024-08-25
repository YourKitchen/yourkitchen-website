import { put } from '@vercel/blob'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Session } from 'next-auth'
import { validatePermissions } from '#misc/utils'
import { getQuery } from '#network/index'

export const POST = validatePermissions(
  {
    permissions: true,
  },
  async (req, session) => {
    const query = getQuery<{ recipeId: string; id: string }>(req)

    const recipeId = query.recipeId as string
    const id = query.id as string

    if (!recipeId) {
      return Response.json(
        {
          ok: false,
          message: 'recipeId not provided',
        },
        {
          status: 400,
        },
      )
    }
    if (!id) {
      return Response.json(
        {
          ok: false,
          message: 'id not provided',
        },
        {
          status: 400,
        },
      )
    }

    const blob = await req.blob()

    // The user is authenticated, so we can update the image for
    const userBlob = await put(`recipes/${recipeId}/${id}.jpg`, blob, {
      access: 'public',
    })

    return Response.json({
      ok: true,
      message: 'Uploaded image succesfully',
      data: userBlob.url,
    })
  },
)
