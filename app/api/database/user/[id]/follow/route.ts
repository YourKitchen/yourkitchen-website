import type { NextApiRequest, NextApiResponse } from 'next'
import { validatePermissions } from '#misc/utils'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const PUT = validatePermissions(
  {
    permissions: true,
  },
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

    const exists = await prisma.follows.findFirst({
      where: {
        followerId: user.id,
        followingId: params.id,
      },
    })

    if (exists) {
      // If the value exists, delete it
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: params.id,
          },
        },
      })
      return Response.json({
        ok: true,
        message: 'Succesfully updated following state',
        data: false,
      })
    }
    // Create it
    await prisma.follows.create({
      data: {
        followerId: user.id,
        followingId: params.id,
      },
    })
    return Response.json({
      ok: true,
      message: 'Succesfully updated following state',
      data: true,
    })
  },
)
