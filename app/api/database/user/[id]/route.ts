import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = async (req: NextRequest) => {
  const query = getQuery<{ id: string }>(req)

  const user = await prisma.user.findUnique({
    where: {
      id: query.id,
    },
    select: {
      id: true,
      feeditems: true,
      followers: {
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              created: true,
            },
          },
        },
      },
      following: {
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              created: true,
            },
          },
        },
      },
      image: true,
      name: true,
      ratings: true,
      recipes: {
        include: {
          image: true,
        },
      },
      created: true,
    },
  })
  if (!user) {
    return Response.json(
      { ok: false, message: 'Unable to find user' },
      {
        status: 404,
      },
    )
  }

  return Response.json({
    ok: true,
    message: 'Succesfully got user',
    data: {
      ...user,
      followers: user.followers.map((follower) => follower.following),
      following: user.following.map((follower) => follower.follower),
    },
  })
}
