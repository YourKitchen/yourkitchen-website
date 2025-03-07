import type { MealPlanRecipe } from '@prisma/client'
import { DateTime } from 'luxon'
import { validatePermissions } from '#misc/utils'
import { getBody, getQuery } from '#network/index'
import prisma from '#prisma'
import { sameDate, updateMealplan } from '#utils/meaplanHelper'

export const GET = validatePermissions(
  { permissions: true },
  async (req, user) => {
    const query = getQuery<{ weekDate?: string }>(req)

    // Get the user's meal plan.
    const currentMealPlan = await prisma.mealPlan.findUnique({
      where: {
        ownerId: user.id,
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

    const weekDate = DateTime.fromISO((query.weekDate ?? '') as string).startOf(
      'week',
    ) // Empty will cause invalid DateTime. This is checked below

    // Apply any updates
    const response = await updateMealplan(
      currentMealPlan,
      user,
      weekDate.isValid ? weekDate : undefined,
    )

    return Response.json(response)
  },
)

export const PUT = validatePermissions(
  {
    permissions: true,
  },
  async (req, user) => {
    const body = await getBody<{
      recipe: Omit<MealPlanRecipe, 'mealPlanId' | 'id'>
    }>(req)

    if (!body) {
      return Response.json(
        {
          ok: false,
          message: 'Body not defined',
        },
        {
          status: 400,
        },
      )
    }

    // The input for updating a meal plan should be a MealPlanRecipe
    const newRecipe = body.recipe

    newRecipe.date = new Date(newRecipe.date as any as string)

    if (!newRecipe) {
      return Response.json(
        {
          ok: false,
          message: 'recipe not defined',
        },
        {
          status: 400,
        },
      )
    }

    // Check if the meal plan exists (It should, but just to guard the remaining code)

    // Get the user's meal plan.
    let currentMealPlan = await prisma.mealPlan.findUnique({
      where: {
        ownerId: user.id,
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
      currentMealPlan = await updateMealplan(currentMealPlan, user)
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

    return Response.json({
      ok: true,
      message: 'Meal plan updated',
      data: currentMealPlan,
    })
  },
)
