import {
  kitchenCreateOne,
  kitchenOwn,
  updateInterest,
} from '@yourkitchen/common'
import { Recipe } from '@yourkitchen/models'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../../../../Contexts/AuthContext'
import { MessageContext, MessageType } from '../../../../Header/Message/Message'

interface ActionsContainerProps {
  recipe: Recipe
  showSteps: boolean
  setShowSteps: React.Dispatch<React.SetStateAction<boolean>>
}

const ActionsContainer: React.FC<ActionsContainerProps> = ({
  recipe,
  showSteps,
  setShowSteps,
}) => {
  const authContext = useContext(AuthContext)
  const { setNewMessage } = useContext(MessageContext)
  // const history = useHistory();
  const [width, setWidth] = React.useState(window.innerWidth)
  const [showShoppingListButton, setShowShoppingListButton] =
    React.useState(true)

  const addToShoppingList = async () => {
    if (authContext.user) {
      setShowShoppingListButton(false)
      let kitchenData = await kitchenOwn()

      if (!kitchenData) {
        const response = await kitchenCreateOne()
        kitchenData = response.record || null
      }

      if (kitchenData) {
        // Kitchen file exists
        const tmpIngredients = kitchenData.shoppinglist
        recipe.ingredients.forEach((recipeIngredient) => {
          const tmpIngredient = recipeIngredient
          kitchenData &&
            kitchenData.shoppinglist.forEach((shoppingIngredient) => {
              if (
                recipeIngredient._id === shoppingIngredient._id &&
                tmpIngredient.amount &&
                shoppingIngredient.amount
              ) {
                tmpIngredient.amount += shoppingIngredient.amount
              }
            })
          tmpIngredients.push(tmpIngredient)
        })
        kitchenData.shoppinglist = tmpIngredients
        setNewMessage('Added recipe to shoppinglist', MessageType.Success)
      }
    }
  }

  // Is called
  const handleResize = () => {
    setWidth(window.innerWidth)
  }

  // On width change
  React.useEffect(() => {
    if (width <= 768) {
      setShowSteps(false)
    } else {
      setShowSteps(true)
    }
  }, [width, setShowSteps])

  // Add resize
  React.useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const startCooking = async (event: React.MouseEvent) => {
    event.preventDefault()

    if (showSteps) {
      // Clicks on browser
    } else {
      // Clicks on mobile
      setShowSteps(true)
    }
    if (authContext.user) {
      updateInterest({ [recipe.cuisine]: 1 })
    }
  }

  const isOwner = () => {
    return authContext.user && authContext.user.ID === recipe.owner?.ID
  }

  return (
    <div className="actionsContainer">
      {authContext.authenticated && showShoppingListButton && (
        <button onClick={addToShoppingList}>Add to Shopping List</button>
      )}
      {isOwner() && <Link to={'/recipe/edit/' + recipe._id}>Edit Recipe</Link>}
      <button onClick={startCooking}>Start Cooking</button>
    </div>
  )
}

export default ActionsContainer
