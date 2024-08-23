import { DateTime } from 'luxon'
import { validatePermissions } from '#misc/utils'
import { getQuery } from '#network/index'
import prisma from '#prisma'
import { updateMealplan } from '#utils/meaplanHelper'

export const GET = validatePermissions(
  {
    permissions: true,
  },
  async (req, session) => {
    const query = getQuery<{ id: string; weekDate?: string }>(req)
    const id = query.id as string

    if (!id) {
      return Response.json(
        {
          ok: false,
          message: 'id is missing for this endpoint',
        },
        {
          status: 400,
        },
      )
    }

    // Get the user's meal plan.
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        OR: [
          {
            public: true,
          },
          {
            ownerId: session?.user.id,
          },
        ],
      },
      include: {
        owner: true,
        recipes: {
          include: {
            recipe: {
              include: {
                image: true,
                owner: true,
                ratings: true,
              },
            },
          },
        },
      },
    })

    const weekDate = DateTime.fromISO((query.weekDate ?? '') as string) // Empty will cause invalid DateTime. This is checked below

    if (mealPlan) {
      const response = await updateMealplan(
        mealPlan,
        mealPlan.owner,
        weekDate.isValid ? weekDate : undefined,
      )

      return Response.json(response)
    }
    return Response.json(null)
  },
)
