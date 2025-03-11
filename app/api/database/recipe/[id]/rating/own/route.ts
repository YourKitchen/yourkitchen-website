import type { Rating } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Session } from 'next-auth'
import type { NextRequest } from 'next/server'
import { validatePermissions } from '#misc/utils'
import { getBody, getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = validatePermissions(
  { permissions: true },
  async (req, user, ctx) => {
    const params = await ctx.params

    if (!params.id) {
      return Response.json(
        {
          ok: false,
          message: 'Id not provided',
        },
        {
          status: 400,
        },
      )
    }

    const rating = await prisma.rating.findFirst({
      where: {
        recipeId: params.id as string,
        ownerId: user.id,
      },
    })

    return Response.json(rating)
  },
)

export const PUT = validatePermissions(
  { permissions: true },
  async (req: NextRequest, user, ctx) => {
    const params = await ctx.params

    if (!params.id) {
      return Response.json(
        {
          ok: false,
          message: 'Id not provided',
        },
        {
          status: 400,
        },
      )
    }

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
          recipeId: params.id as string,
          ownerId: user.id,
        },
      },
      create: {
        score,
        message,
        recipeId: params.id as string,
        ownerId: user.id,
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
