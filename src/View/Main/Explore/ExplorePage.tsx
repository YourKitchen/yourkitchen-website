import React, { useState } from 'react'
import './ExplorePage.css'
import { Recipe } from '@yourkitchen/models'
import RecipeRow from '../Recipe/RecipeRow'
import { recipeMany } from '@yourkitchen/common'

const ExplorePage: React.FC = () => {
  document.title = 'Explore | YourKitchen'

  const [recipes, setRecipes] = useState<Partial<Recipe>[]>()

  React.useEffect(() => {
    ;(async () => {
      const recipes = await recipeMany({})
      recipes && setRecipes(recipes)
    })()
  }, [])

  return (
    <div>
      <h1>Explore</h1>
      {
        // Category
      }
      <div className="recipeWrapper">
        {recipes?.map((recipe) => (
          <RecipeRow key={recipe._id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}

export default ExplorePage
