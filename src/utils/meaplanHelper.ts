import prisma from '#pages/api/_base'
import {
  MealPlan,
  MealPlanRecipe,
  MealType,
  Recipe,
  RecipeType,
} from '@prisma/client'
import { DateTime } from 'luxon'
import { Session } from 'next-auth'
import { v4 } from 'uuid'

export const getRandomRecipe = async (
  {
    cuisineName,
    recipeType,
    mealType,
    excludeIds,
  }: {
    cuisineName?: string
    recipeType: RecipeType
    mealType: MealType
    excludeIds: string[]
  },
  session: Session,
): Promise<Recipe | null> => {
  const allergenList = session.user.allergenes

  const count = await prisma.recipe.count({
    where: {
      id: {
        notIn: excludeIds,
      },
      cuisineName,
      // Check that the user is not allergic to the ingredients in this dish
      ingredients: {
        none: {
          ingredient: {
            allergenTypes: {
              hasSome: allergenList,
            },
          },
        },
      },
      mealType,
      recipeType,
    },
  })

  // Get a random index
  const index = Math.round(Math.random() * (count - 1))

  const recipe = await prisma.recipe.findFirst({
    skip: index,
    take: 1,
  })

  return recipe
}

export const sameDate = (dateTime1: DateTime, dateTime2: DateTime) => {
  return dateTime1.toFormat('dd-MM-yyyy') === dateTime2.toFormat('dd-MM-yyyy')
}

export const updateMealplan = async (
  currentMealPlan: (MealPlan & { recipes: MealPlanRecipe[] }) | null,
  session: Session,
): Promise<MealPlan & { recipes: MealPlanRecipe[] }> => {
  let tmpMealPlan = currentMealPlan
  if (!currentMealPlan) {
    tmpMealPlan = {
      id: v4(),

      ownerId: session.user.id,

      recipes: [],

      updated: new Date(),
      created: new Date(),
    }
  }

  if (!tmpMealPlan) {
    // Just here for typescript
    throw new Error('Not possible')
  }

  // Check that there are at least recipes for the next week.
  const currentRecipeIds = tmpMealPlan.recipes.map((recipe) => recipe.recipeId)

  const newRecipes: MealPlanRecipe[] = []

  const currentDateTime = DateTime.utc()
  for (const i = 0; i < 7; ) {
    // Check if a main dish already exists for dinner for the currentDateTime
    if (
      !tmpMealPlan.recipes.some(
        (recipe) =>
          recipe.mealType === MealType.DINNER &&
          recipe.recipeType === RecipeType.MAIN &&
          sameDate(DateTime.fromJSDate(recipe.date), currentDateTime),
      )
    ) {
      // Add a recipe for this datetime
      const recipe = await getRandomRecipe(
        {
          excludeIds: currentRecipeIds,

          // TODO: Pro users will be given a full meal plan, with the option of generating sides for some week days.
          // The default meal plan will only contain
          recipeType: RecipeType.MAIN,
          mealType: MealType.DINNER,
        },
        session,
      )

      if (!recipe) {
        // Skip until next fetch, because it might cause infinite loop if we keep trying.
        // Also this will almost never happen, if the functionality of getRandomRecipe works.
        // This will also prevent crashing if there are too few recipes in the beginning.
        continue
      }

      newRecipes.push({
        id: v4(),
        date: currentDateTime.toJSDate(),
        mealPlanId: tmpMealPlan.id,
        mealType: MealType.DINNER,
        recipeId: recipe.id,
        recipeType: RecipeType.MAIN,
      })

      // Add this recipe to the list we want to be without
      currentRecipeIds.push(recipe.id)
    }

    currentDateTime.plus({
      day: 1,
    })
  }

  // Prevent stalling the client, if there are no updates. (Will also be higher than one, if it is the first time creating the meal plan).
  if (newRecipes.length > 0) {
    const response = await prisma.mealPlan.upsert({
      where: {
        id: tmpMealPlan.id,
      },
      update: {
        // Just create all the new recipes
        recipes: {
          createMany: {
            data: newRecipes,
          },
        },
      },
      create: {
        id: tmpMealPlan.id,
        recipes: {
          createMany: {
            data: newRecipes,
          },
        },
        ownerId: session.user.id,
      },
      include: {
        recipes: true,
      },
    })

    return response
  }
  return tmpMealPlan
}
