import type { User } from 'next-auth'
import type {
  Rating,
  Recipe,
  RecipeImage,
} from 'prisma/generated/prisma/client'

export type PublicRecipe = Recipe & {
  image: RecipeImage[]
  ratings: Pick<Rating, 'score'>[]
  owner: User
}
