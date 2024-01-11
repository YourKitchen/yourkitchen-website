import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { sameDate, updateMealplan } from '#utils/meaplanHelper'
import { MealPlanRecipe } from '@prisma/client'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({
      ok: false,
      message: 'Unauthenticated',
    })
    return
  }

  try {
    if (req.method === 'GET') {
      await handleGET(req, res, session)
    } else if (req.method === 'PUT') {
      await handlePUT(req, res, session)
    } else {
      res.status
    }
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
  }
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // Get the user's meal plan.
  const currentMealPlan = await prisma.mealPlan.findUnique({
    where: {
      ownerId: session.user.id,
    },
    include: {
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

  const weekDate = DateTime.fromISO((req.query.weekDate ?? '') as string) // Empty will cause invalid DateTime. This is checked below

  // Apply any updates
  const response = await updateMealplan(
    currentMealPlan,
    session.user,
    weekDate.isValid ? weekDate : undefined,
  )

  res.json(response)
}

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // The input for updating a meal plan should be a MealPlanRecipe
  const newRecipe = req.body.recipe as Omit<MealPlanRecipe, 'mealPlanId' | 'id'>

  newRecipe.date = new Date(newRecipe.date as any as string)

  if (!newRecipe) {
    res.status(400).json({
      ok: false,
      message: 'recipe not defined',
    })
    return
  }

  // Check if the meal plan exists (It should, but just to guard the remaining code)

  // Get the user's meal plan.
  let currentMealPlan = await prisma.mealPlan.findUnique({
    where: {
      ownerId: session.user.id,
    },
    include: {
      recipes: {
        include: {
          recipe: {
            include: {
              image: true,
              ratings: true,
            },
          },
        },
      },
    },
  })

  if (!currentMealPlan) {
    // Apply any updates
    currentMealPlan = await updateMealplan(currentMealPlan, session.user)
  }

  // We now have the meal plan. So now we can update it.
  // Check if there is a recipe that needs to be deleted.
  const deleteRecipe = currentMealPlan.recipes.find(
    (recipe) =>
      recipe.mealType === newRecipe.mealType &&
      recipe.recipeType === newRecipe.recipeType &&
      sameDate(
        DateTime.fromJSDate(recipe.date),
        DateTime.fromJSDate(newRecipe.date),
      ),
  )

  if (deleteRecipe) {
    await prisma.mealPlanRecipe.delete({
      where: {
        id: deleteRecipe.id,
      },
    })
  }

  // Create the new mealPlanRecipe
  const response = await prisma.mealPlanRecipe.create({
    data: {
      ...newRecipe,
      mealPlanId: currentMealPlan.id,
    },
    include: {
      recipe: {
        include: {
          image: true,
          ratings: true,
        },
      },
    },
  })

  const replaceIndex = currentMealPlan.recipes.findIndex(
    (recipe) => recipe.id === deleteRecipe?.id,
  )

  if (replaceIndex) {
    // If we are replacing an old recipe, keep its location intact
    currentMealPlan.recipes[replaceIndex] = response
  } else {
    currentMealPlan.recipes.push(response)
  }

  res.json({ ok: true, message: 'Meal plan updated', data: currentMealPlan })
}

export default handler
