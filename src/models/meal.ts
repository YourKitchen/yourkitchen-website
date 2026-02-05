import type {
  MealPlanRecipe,
  Rating as PrismaRating,
  Recipe,
  RecipeImage,
} from 'prisma/generated/prisma/client'

export type Meal = (MealPlanRecipe & {
  recipe: Recipe & {
    image: RecipeImage[]
    ratings: PrismaRating[]
  }
})[]
