import type { NextApiRequest, NextApiResponse } from 'next'
import { validatePermissions } from '#misc/utils'
import prisma from '#prisma'

export const GET = validatePermissions(
  {
    permissions: true,
  },
  async (req, session) => {
    // Get the user's meal plan.
    const response = await prisma.mealPlan.findMany({
      where: {
        public: true,
        owner: {
          followers: {
            some: {
              // If we are following the owner, show their meal plan
              followerId: session.user.id,
            },
          },
        },
      },
      include: {
        owner: true,
      },
    })

    return Response.json(response)
  },
)
