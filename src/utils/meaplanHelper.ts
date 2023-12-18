import prisma from '#pages/api/_base'
import {
  MealPlan,
  MealPlanRecipe,
  MealType,
  Recipe,
  RecipeType,
  User,
} from '@prisma/client'
import { DateTime } from 'luxon'
import { v4 } from 'uuid'

export const getRandomRecipes = async (
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
    count: number
  },
  user: User,
): Promise<Recipe[]> => {
  const allergenList = user.allergenes

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

  // Get a random indexes
  const indexes: number[] = []
  for (let i = 0; indexes.length < count; i++) {
    const index = Math.round(Math.random() * (count - 1))

    if (!indexes.includes(index)) {
      // To prevent same recip multiple times.
      indexes.push(index)
    }
    if (index === count - 1) {
      // To prevent infinite loop
      break
    }
  }

  const recipes = await Promise.all(
    indexes.map((index) =>
      prisma.recipe.findFirst({
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
        skip: index,
        take: 1,
      }),
    ),
  )

  return recipes.filter((recipe) => recipe !== null) as Recipe[]
}

export const sameDate = (dateTime1: DateTime, dateTime2: DateTime) => {
  return dateTime1.toFormat('dd-MM-yyyy') === dateTime2.toFormat('dd-MM-yyyy')
}

export const updateMealplan = async (
  currentMealPlan: (MealPlan & { recipes: MealPlanRecipe[] }) | null,
  user: User,
  startDate: DateTime = DateTime.utc().startOf('week'),
): Promise<MealPlan & { recipes: MealPlanRecipe[] }> => {
  let tmpMealPlan = currentMealPlan
  if (!currentMealPlan) {
    tmpMealPlan = {
      id: v4(),

      ownerId: user.id,

      recipes: [],

      public: true,

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

  const dates: DateTime[] = []

  let currentDateTime = startDate

  for (let i = 0; i < 7; i++) {
    dates.push(currentDateTime)

    currentDateTime = currentDateTime.plus({
      day: 1,
    })
  }

  const missingDates: DateTime[] = dates
    .map((currentDateTime) => {
      if (!tmpMealPlan) {
        throw new Error('Not possible, but here for typescript')
      }
      // Check if a main dish already exists for dinner for the currentDateTime
      if (
        tmpMealPlan.recipes.some(
          (recipe) =>
            recipe.mealType === MealType.DINNER &&
            recipe.recipeType === RecipeType.MAIN &&
            sameDate(DateTime.fromJSDate(recipe.date), currentDateTime),
        )
      ) {
        return null
      }

      return currentDateTime
    })
    .filter((date) => date !== null) as DateTime[]

  // Add a recipe for this datetime
  const recipes = await getRandomRecipes(
    {
      excludeIds: currentRecipeIds,

      // TODO: Pro users will be given a full (All 3 types of meals) meal plan, with the option of generating sides for some week days.
      // The default meal plan will only contain
      recipeType: RecipeType.MAIN,
      mealType: MealType.DINNER,
      count: missingDates.length,
    },
    user,
  )

  const newRecipes: (Omit<MealPlanRecipe, 'mealPlanId'> | null)[] =
    missingDates.map((date, index) => {
      // Get the date at the index
      if (recipes[index] && date) {
        return {
          id: v4(),
          date: date.toJSDate(),
          mealType: MealType.DINNER,
          recipeId: recipes[index].id,
          recipeType: RecipeType.MAIN,
        } as Omit<MealPlanRecipe, 'mealPlanId'>
      }
      return null
    })

  const newFilteredRecipes = newRecipes.filter(
    (recipe) => recipe !== null,
  ) as MealPlanRecipe[]

  // Prevent stalling the client, if there are no updates. (Will also be higher than one, if it is the first time creating the meal plan).
  if (newFilteredRecipes.length > 0) {
    const response = await prisma.mealPlan.upsert({
      where: {
        id: tmpMealPlan.id,
      },
      update: {
        // Just create all the new recipes
        recipes: {
          createMany: {
            data: newFilteredRecipes,
          },
        },
      },
      create: {
        id: tmpMealPlan.id,
        recipes: {
          createMany: {
            data: newFilteredRecipes,
          },
        },
        ownerId: user.id,
      },
      include: {
        recipes: true,
      },
    })

    return response
  }
  return tmpMealPlan
}
