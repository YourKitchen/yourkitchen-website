import type {
  MealPlanRecipe,
  Recipe,
  RecipeImage,
  Rating as PrismaRating,
} from '@prisma/client'

export type Meal = (MealPlanRecipe & {
  recipe: Recipe & {
    image: RecipeImage[]
    ratings: PrismaRating[]
  }
})[]
