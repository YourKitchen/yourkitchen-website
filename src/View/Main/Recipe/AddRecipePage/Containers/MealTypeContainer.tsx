import React from 'react'

interface MealTypeContainerProps {
  mealType: string
  setMealType: (value: string) => void
}

const MealTypeContainer: React.FC<MealTypeContainerProps> = ({
  mealType,
  setMealType,
}) => {
  return (
    <select
      value={mealType}
      onChange={(event) => {
        setMealType(event.target.value)
      }}
    >
      <option value="breakfast">Breakfast</option>
      <option value="lunch">Lunch</option>
      <option value="dinner">Dinner</option>
    </select>
  )
}

export default MealTypeContainer
