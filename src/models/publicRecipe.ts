import type { Rating, Recipe, RecipeImage } from '@prisma/client'
import type { User } from 'next-auth'

export type PublicRecipe = Recipe & {
  image: RecipeImage[]
  ratings: Pick<Rating, 'score'>[]
  owner: User
}
