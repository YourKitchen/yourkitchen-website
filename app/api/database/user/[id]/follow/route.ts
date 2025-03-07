import type { NextApiRequest, NextApiResponse } from 'next'
import { validatePermissions } from '#misc/utils'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const PUT = validatePermissions(
  {
    permissions: true,
  },
  async (req, user) => {
    const query = getQuery<{ id: string }>(req)
    const id = query.id as string

    const exists = await prisma.follows.findFirst({
      where: {
        followerId: user.id,
        followingId: id,
      },
    })

    if (exists) {
      // If the value exists, delete it
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: id,
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
        followingId: id,
      },
    })
    return Response.json({
      ok: true,
      message: 'Succesfully updated following state',
      data: true,
    })
  },
)
