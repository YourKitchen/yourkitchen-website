import {
  kitchenCreateOne,
  kitchenOwn,
  updateKitchen,
} from '@yourkitchen/common'
import { Ingredient, Kitchen } from '@yourkitchen/models'
import React from 'react'
import { AuthContext } from './AuthContext'

type ContextProps = {
  kitchen?: Kitchen
  setKitchen: React.Dispatch<React.SetStateAction<Kitchen | undefined>>
  ingredients: Ingredient[]
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>
}

export const KitchenContext = React.createContext<ContextProps>({
  kitchen: undefined,
  setKitchen: () => {},
  ingredients: [],
  setIngredients: () => {},
})

export const KitchenProvider: React.FC = ({ children }) => {
  const [kitchen, setKitchen] = React.useState<Kitchen>()
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([])

  const { user } = React.useContext(AuthContext)

  React.useEffect(() => {
    ;(async () => {
      if (user) {
        try {
          const response = await kitchenOwn()
          if (!response) {
            const createResponse = await kitchenCreateOne()
            setKitchen(createResponse.record)
          } else {
            setKitchen(response)
          }
        } catch (err) {
          console.error(err)
        }
      }
    })()
  }, [user])

  React.useEffect(() => {
    if (kitchen) {
      const tmpKitchen = kitchen as Partial<Kitchen>
      delete tmpKitchen._id
      delete tmpKitchen.ownerId
      if (
        (tmpKitchen.refrigerator && tmpKitchen.refrigerator.length > 0) ||
        (tmpKitchen.shoppinglist && tmpKitchen.shoppinglist.length > 0)
      ) {
        updateKitchen(tmpKitchen)
      }
    }
  }, [kitchen])

  return (
    <KitchenContext.Provider
      value={{
        kitchen,
        setKitchen,
        ingredients,
        setIngredients,
      }}
    >
      {children}
    </KitchenContext.Provider>
  )
}
