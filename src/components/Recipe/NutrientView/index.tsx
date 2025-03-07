import type { Ingredient, Recipe, RecipeIngredient } from '@prisma/client'
import React, { type FC } from 'react'

export interface NutrientViewProps {
  recipe: Recipe & {
    ingredients: (RecipeIngredient & {
      ingredient: Ingredient
    })[]
  }
}

// TODO: Implement this when nutrient pr has been merged
const NutrientView: FC<NutrientViewProps> = ({ recipe }) => {
  return <div>NutrientView</div>
}

export default NutrientView
