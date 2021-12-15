import React from 'react'
import { Recipe } from '@yourkitchen/models'

interface PersonsInterface {
  value: string
  label: string
}

interface IngredientContainerInterface {
  recipe: Recipe
}

const IngredientContainer: React.FC<IngredientContainerInterface> = ({
  recipe,
}) => {
  const [persons, setPersons] = React.useState(4)

  const initialPersons: PersonsInterface[] = []
  for (let i = 1; i <= 20; i++) {
    initialPersons.push({
      value: i.toString(),
      label: i + (i === 1 ? ' Person' : ' Persons'),
    })
  }

  React.useEffect(() => {
    if (recipe.persons === undefined) {
      recipe.persons = 4
    }
    setPersons(recipe.persons)
  }, [recipe])

  const getIngredientAmount = (amount?: number) => {
    if (amount === undefined) {
      return 0
    }
    if (recipe.persons === undefined) {
      recipe.persons = 4
    }
    const multiplier = persons / recipe.persons
    return amount * multiplier
  }

  return (
    <div className="ingredientContainer">
      <h2>Ingredients</h2>
      <select
        value={persons}
        onChange={(event) => {
          setPersons(parseInt(event.target.value))
        }}
      >
        {initialPersons.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <ul>
        {recipe.ingredients.map((ingredient) => (
          <li className="ingredient" key={ingredient._id}>
            {getIngredientAmount(ingredient.amount) +
              (ingredient.unit || '') +
              ' ' +
              ingredient.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default IngredientContainer
