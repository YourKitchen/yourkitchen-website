import { DateTime } from 'luxon'
import { validatePermissions } from '#misc/utils'
import prisma from '#prisma'

// Validate the permissions and only allow bypass by CRON_SECRET
export const GET = validatePermissions(
  {
    permissions: false,
    bypass: (req) => {
      return (
        req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`
      )
    },
  },
  async () => {
    // Remove meal plan recipes that are older than 2 weeks ago
    await prisma.mealPlanRecipe.deleteMany({
      where: {
        date: {
          lte: DateTime.utc()
            .minus({
              week: 2,
            })
            .startOf('day')
            .toJSDate(),
        },
      },
    })

    return Response.json({
      ok: true,
      message: 'Cleanup succesful',
    })
  },
)
