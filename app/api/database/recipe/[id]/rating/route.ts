import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import { getQuery } from '#network/index'
import prisma from '#prisma'

export const GET = async (req: NextRequest) => {
  const query = getQuery<{ id: string }>(req)

  const ratings = await prisma.rating.findMany({
    where: {
      recipeId: query.id as string,
    },
  })

  return Response.json({
    ok: true,
    message: 'Succesfully got rating',
    data: ratings,
  })
}
