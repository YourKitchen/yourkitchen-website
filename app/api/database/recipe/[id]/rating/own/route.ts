import type { Rating } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Session } from 'next-auth'
import type { NextRequest } from 'next/server'
import { validatePermissions } from '#misc/utils'
import { getBody, getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = validatePermissions(
  { permissions: true },
  async (req, session) => {
    const query = getQuery<{ id: string }>(req)
    const rating = await prisma.rating.findFirst({
      where: {
        recipeId: query.id as string,
        ownerId: session.user.id,
      },
    })

    return Response.json(rating)
  },
)

export const PUT = validatePermissions(
  { permissions: true },
  async (req: NextRequest, session: Session) => {
    const query = getQuery<{ id: string }>(req)
    const body = await getBody<Partial<Rating>>(req)

    if (!body) {
      return Response.json(
        { ok: false, message: 'Body not defined' },
        {
          status: 400,
        },
      )
    }

    const { score, message } = body

    if (!score) {
      return Response.json(
        {
          ok: false,
          message: 'score missing in request',
        },
        {
          status: 400,
        },
      )
    }

    const rating = await prisma.rating.upsert({
      where: {
        recipeId_ownerId: {
          recipeId: query.id as string,
          ownerId: session.user.id,
        },
      },
      create: {
        score,
        message,
        recipeId: query.id as string,
        ownerId: session.user.id,
      },
      update: {
        score,
        message,
      },
    })

    return Response.json({
      ok: true,
      message: 'Succesfully updated rating',
      data: rating,
    })
  },
)
