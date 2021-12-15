import {
  getImageUrl,
  ratingInfo,
  recipeById,
  toTitleCase,
} from '@yourkitchen/common'
import { Recipe } from '@yourkitchen/models'
import React from 'react'
import LoadingIndicator from 'react-loading-indicator'
import { Link, useMatch } from 'react-router-dom'
import ActionsContainer from './Containers/ActionsContainer'
import IngredientContainer from './Containers/IngredientContainer'
import RecipeInfoContainer from './Containers/RecipeInfoContainer'
import StepsContainer from './Containers/StepsContainer'
import './RecipePage.css'
import Helmet from 'react-helmet'

const RecipePage: React.FC = () => {
  document.title = 'Recipe | YourKitchen' // Placeholder title
  const match = useMatch('/recipe/:id')
  const [recipe, setRecipe] = React.useState<Recipe>()
  const [loading, setLoading] = React.useState(true)
  const [showSteps, setShowSteps] = React.useState(window.innerWidth >= 768)
  const [ratings, setRatings] =
    React.useState<{ count: number; min: number; max: number }>()

  const structuredData = React.useMemo(() => {
    if (!recipe) {
      return ''
    }
    const recipeStructuredData = {
      '@context': 'http://schema.org/',
      '@type': 'Recipe',
      name: recipe.name,
      image: recipe.image,
      author: {
        '@type': recipe.owner && recipe.owner.name ? 'Person' : 'Organization',
        name: recipe.owner?.name || 'YourKitchen',
        image: recipe.owner?.image || undefined,
      },
      datePublished: recipe.created_at,
      description: recipe.description,
      recipeYield: recipe.persons,
      recipeCuisine: toTitleCase(recipe.cuisine),
      recipeCategory: recipe.mealType,
      recipeIngredient: recipe.ingredients.map(
        (ingredient) =>
          `${ingredient.amount || 0} ${ingredient.unit || ''} ${
            ingredient.name
          }`,
      ),
      recipeInstructions: recipe.steps.map((step) => ({
        '@type': 'HowToStep',
        text: step,
      })),
    }
    if (ratings !== undefined && ratings.count > 0) {
      recipeStructuredData['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingCount: ratings.count.toString(),
        ratingValue: recipe.rating.toString(),
        bestRating: ratings.max.toString(),
        worstRating: ratings.min.toString(),
      }
    }
    return JSON.stringify(recipeStructuredData)
  }, [recipe, ratings])

  React.useEffect(() => {
    const id = match?.params.id
    if (id) {
      //Get recipe
      ;(async () => {
        try {
          setLoading(true)
          const recipeData = await recipeById(id)
          if (recipeData) {
            setRecipe(recipeData)
          }
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      })()
      // Get ratings info
      ;(async () => {
        try {
          const ratingData = await ratingInfo(id)
          if (ratingData) {
            setRatings(ratingData)
          }
        } catch (err) {
          console.error(err)
        }
      })()
    }
  }, [])

  if (loading) {
    return <LoadingIndicator />
  } else if (recipe) {
    return (
      <div className="recipeView">
        <Helmet>
          <title>{recipe?.name || 'Recipe'} | YourKitchen</title>
          <script className="structured-data-list" type="application/ld+json">
            {structuredData}
          </script>
        </Helmet>
        <div className="recipeHeader">
          <img
            className="recipeImage"
            src={getImageUrl(recipe.image, { width: 250, height: 250 })}
            alt={recipe.name}
          ></img>
          {recipe.owner && (
            <Link to={'/user/' + recipe.owner.ID}>
              <img
                className="userImage"
                alt={recipe.owner.name}
                src={getImageUrl(recipe.owner.image, { width: 75, height: 75 })}
              />
            </Link>
          )}
        </div>
        <h1>{recipe.name}</h1>
        <h3>
          By{' '}
          <Link style={{ color: '#000' }} to={'/user/' + recipe.owner?.ID}>
            {recipe.owner?.name}
          </Link>
        </h3>
        <RecipeInfoContainer recipe={recipe} />
        <IngredientContainer recipe={recipe} />
        <StepsContainer showSteps={showSteps} recipe={recipe} />
        <ActionsContainer
          showSteps={showSteps}
          setShowSteps={setShowSteps}
          recipe={recipe}
        />
      </div>
    )
  } else {
    return <p>Couldn't load recipe</p>
  }
}

export default RecipePage
