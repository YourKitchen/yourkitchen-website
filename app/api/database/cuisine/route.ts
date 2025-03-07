import type { NextRequest } from 'next/server'
import { validatePermissions } from '#misc/utils'
import { getBody } from '#network/index'
import prisma from '#prisma'

export const GET = async (req: NextRequest) => {
  const {
    nextUrl: { search },
  } = req
  const urlSearchParams = new URLSearchParams(search)
  const params = Object.fromEntries(urlSearchParams.entries())

  const take = params.take

  const cuisines = await prisma.cuisine.findMany({
    take: take ? Number.parseInt(take) : undefined,
  })

  return Response.json({
    ok: true,
    message: 'Succesfully got cuisines',
    data: cuisines,
  })
}

export const POST = validatePermissions(
  {
    permissions: true, // Just make sure the user is logged in.
  },
  async (req: NextRequest, user) => {
    const body = await getBody<{ name: string }>(req)
    const name = body?.name

    if (!name) {
      return Response.json(
        {
          ok: false,
          message: 'name is missing from the body',
        },
        {
          status: 400,
        },
      )
    }

    let hasPermission = false
    if (user.role !== 'ADMIN') {
      hasPermission = true
    }

    if (!hasPermission) {
      const score = await prisma.rating.aggregate({
        _sum: {
          score: true,
        },
        where: {
          ownerId: user.id,
        },
      })

      if ((score._sum.score ?? 0) >= 25) {
        hasPermission = true
      }
    }

    if (hasPermission) {
      const response = await prisma.cuisine.create({
        data: {
          name,
        },
      })
      return Response.json({
        ok: false,
        message: 'Succesfully created cuisine',
        data: response,
      })
    }
    return Response.json(
      {
        ok: false,
        message: 'You do not have a score of over 25',
      },
      {
        status: 403,
      },
    )
  },
)
