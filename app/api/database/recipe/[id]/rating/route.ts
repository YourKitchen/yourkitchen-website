import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
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

  const ratings = await prisma.rating.findMany({
    where: {
      recipeId: params.id as string,
    },
  })

  return Response.json({
    ok: true,
    message: 'Succesfully got rating',
    data: ratings,
  })
}
