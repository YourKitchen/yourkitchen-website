import {
  mealplanCreate,
  mealplanOne,
  mealplanUpdate,
} from '@yourkitchen/common'
import { MealPlan } from '@yourkitchen/models'
import React from 'react'
import { AuthContext } from './AuthContext'

type ContextProps = {
  mealplan?: MealPlan
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlan | undefined>>
}

export const MealplanContext = React.createContext<ContextProps>({
  mealplan: undefined,
  setMealPlan: () => {},
})

export const MealplanProvider: React.FC = ({ children }) => {
  const [mealplan, setMealPlan] = React.useState<MealPlan>()
  const [initialMealplan, setInitialMealplan] = React.useState<MealPlan>()

  const { user } = React.useContext(AuthContext)

  React.useEffect(() => {
    ;(async () => {
      if (user) {
        try {
          let response = await mealplanOne(user)
          if (!response) {
            console.log('Creating meal plan')
            response = await mealplanCreate()
          }
          if (response) {
            const tmpResponse = response
            tmpResponse.meals = tmpResponse.meals.map((meal) => ({
              ...meal,
              date: new Date(meal.date),
            }))
            setInitialMealplan(tmpResponse)
          }
        } catch (err) {
          console.error('Mealplan error', JSON.stringify(err))
        }
      }
    })()
  }, [user])

  React.useEffect(() => {
    setMealPlan(initialMealplan)
  }, [initialMealplan])

  React.useEffect(() => {
    ;(async () => {
      if (
        mealplan &&
        initialMealplan &&
        mealplan !== initialMealplan &&
        mealplan.meals !== initialMealplan.meals
      ) {
        console.log('Updating mealplan')
        const tmpmealplan = mealplan as Partial<MealPlan>
        delete tmpmealplan._id
        delete tmpmealplan.ownerId
        if (tmpmealplan.meals && tmpmealplan.meals.length > 0) {
          const updateResponse = await mealplanUpdate(tmpmealplan)
          setInitialMealplan(updateResponse.record)
        }
      }
    })()
  }, [mealplan])

  return (
    <MealplanContext.Provider
      value={{
        mealplan,
        setMealPlan,
      }}
    >
      {children}
    </MealplanContext.Provider>
  )
}
