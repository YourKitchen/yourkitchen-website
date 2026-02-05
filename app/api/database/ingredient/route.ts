import type { Ingredient } from 'prisma/generated/prisma/client'
import { getIngredientId } from 'src/utils'
import { validatePermissions } from '#misc/utils'
import { getBody } from '#network/index'
import prisma from '../../../../src/misc/prisma'

export const POST = validatePermissions(
  {
    // TODO: Enable this when a certain amount of ingredients have been created.
    // At this point it does not make sense as it would limit the usability of the application.
    // permissions: (user) => {
    //   if (user.role === 'ADMIN' || user.score >= 5) {
    //     return true
    //   }
    //   return 'You need a score of at least 5'
    // },
    permissions: true,
  },
  async (req, _user) => {
    const body = await getBody<Ingredient>(req)

    if (!body) {
      return Response.json(
        {
          ok: false,
          message: 'No body provided',
        },
        {
          status: 400,
        },
      )
    }

    const { name, allergenTypes } = body

    const response = await prisma.ingredient.create({
      data: {
        id: getIngredientId(name),
        name,
        allergenTypes,
      },
    })

    return Response.json({
      ok: true,
      message: 'Succesfully created the recipe',
      data: response,
    })
  },
)
