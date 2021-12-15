import React from 'react'
import { Recipe } from '@yourkitchen/models'
import { toTitleCase } from '@yourkitchen/common'

interface RecipeInfoContainerProps {
  recipe: Recipe
}

const RecipeInfoContainer: React.FC<RecipeInfoContainerProps> = ({
  recipe,
}) => {
  return (
    <div className="recipeInfoContainer">
      <p>{toTitleCase(recipe.cuisine)}</p>
      <p>
        {'Time: ' +
          recipe.preparationTime.hours +
          'h ' +
          recipe.preparationTime.minutes +
          'm'}
      </p>
      <p>{recipe.steps.length + ' steps'}</p>
      <p>{recipe.ingredients.length + ' ingredients'}</p>
      {/* <p>{new Date(recipe).toDateString()}</p> */}
    </div>
  )
}

export default RecipeInfoContainer
