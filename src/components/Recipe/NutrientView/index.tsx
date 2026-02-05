import type {
  Ingredient,
  Recipe,
  RecipeIngredient,
} from 'prisma/generated/prisma/client'
import type { FC } from 'react'

export interface NutrientViewProps {
  recipe: Recipe & {
    ingredients: (RecipeIngredient & {
      ingredient: Ingredient
    })[]
  }
}

// TODO: Implement this when nutrient pr has been merged
const NutrientView: FC<NutrientViewProps> = () => {
  return <div>NutrientView</div>
}

export default NutrientView
