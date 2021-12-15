import React from 'react'
import { Link } from 'react-router-dom'
import { Recipe } from '@yourkitchen/models'
import { getImageUrl } from '@yourkitchen/common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type RecipeProps = {
  recipe: Partial<Recipe>
}

const RecipeRow: React.FC<RecipeProps> = ({ recipe }) => {
  const image = React.useMemo(() => {
    const value = getImageUrl(recipe.image, { width: 275, height: 225 })
    if (value === '' || !recipe.image) {
      return (
        <FontAwesomeIcon
          style={{
            height: '100%',
          }}
          size={'8x'}
          color={'#222'}
          icon={{ iconName: 'circle', prefix: 'fas' }}
        />
      )
    } else {
      return <img src={value} alt={recipe.name} />
    }
  }, [recipe.image])

  return (
    <Link to={'/recipe/' + recipe._id}>
      <div className="recipe">
        {image}
        <p>{recipe.name}</p>
      </div>
    </Link>
  )
}

export default RecipeRow
