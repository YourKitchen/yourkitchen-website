import React from 'react'

interface RecipeTypeContainerProps {
  recipeType: string
  setRecipeType: (value: string) => void
}

const RecipeTypeContainer: React.FC<RecipeTypeContainerProps> = ({
  recipeType,
  setRecipeType,
}) => {
  return (
    <select
      value={recipeType}
      onChange={(event) => {
        setRecipeType(event.target.value)
      }}
    >
      <option value="main">Main</option>
      <option value="side">Side</option>
      <option value="drink">Drink</option>
      <option value="ingredient">Ingredient</option>
    </select>
  )
}

export default RecipeTypeContainer
