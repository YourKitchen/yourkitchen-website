import {
  ingredientCreateOne,
  ingredientsMany,
  search,
} from '@yourkitchen/common'
import { Ingredient } from '@yourkitchen/models'
import React, { useContext } from 'react'
import { AuthContext } from '../../../../Contexts/AuthContext'
import { MessageContext } from '../../../Header/Message/Message'

interface SelectIngredientProps {
  callback: (ingredient: Ingredient) => void
  cancel: () => void
}

const SelectIngredient: React.FC<SelectIngredientProps> = ({
  callback,
  cancel,
}) => {
  const { setNewMessage } = React.useContext(MessageContext)

  const [ingredients, setIngredients] = React.useState<Ingredient[]>([])
  const [searchIngredients, setSearchIngredients] = React.useState<
    Ingredient[]
  >([])
  const [searchText, setSearchText] = React.useState('')

  // Context
  const authContext = useContext(AuthContext)

  // Create Ingredient
  const [ingredientName, setIngredientName] = React.useState('')
  const [ingredientType, setIngredientType] = React.useState('vegetables')

  // Amount
  const [Amount, setAmount] = React.useState('')
  const [Unit, setUnit] = React.useState('')

  // View rendering
  const [SelectedIngredient, setSelectedIngredient] = React.useState<
    Ingredient | undefined
  >()
  const [showCreateIngredient, setShowCreateIngredient] = React.useState(false)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const errorHandler = (responseData: {
    recordId?: string
    error?: { message: string }
  }) => {
    if (responseData.error && responseData.error.message) {
      setNewMessage(responseData.error.message)
      return true
    }
    return false
  }

  React.useEffect(() => {
    ;(async () => {
      const results = await search(searchText, ['ingredient'])
      results && setSearchIngredients(results.map((val) => val as Ingredient))
    })()
  }, [searchText])

  React.useEffect(() => {
    ;(async () => {
      const tmpIngredients = await ingredientsMany()

      tmpIngredients && setIngredients(tmpIngredients)
    })()
  }, [])

  const onAmountSubmit = () => {
    if (!SelectedIngredient) {
      return
    }
    if (!parseInt(Amount)) {
      alert('You need to define an amount')
      return
    }
    const tmpIngredient = SelectedIngredient
    tmpIngredient.amount = parseInt(Amount)
    tmpIngredient.unit = Unit
    callback(tmpIngredient)
  }

  const onCreateIngredientSubmit = async () => {
    if (!authContext.user) {
      return
    }
    const ingredient: Partial<Ingredient> = {
      name: ingredientName,
      type: ingredientType,
      unit: 'g',
      amount: 0,
      count: 0,
      ownerId: authContext.user.ID,
    }
    const responseData = await ingredientCreateOne(ingredient)
    if (!errorHandler(responseData)) {
      ingredient._id = responseData.recordId
      setSelectedIngredient(responseData.record)
      setShowCreateIngredient(false)
    }
  }

  if (showCreateIngredient) {
    return (
      <div className="selectIngredient">
        <h2>Create Ingredient</h2>
        <button
          className="actionButton"
          onClick={() => {
            setShowCreateIngredient(false)
          }}
        >
          Back
        </button>
        <input
          type="text"
          placeholder="Name"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
        />
        <select
          value={ingredientType}
          onChange={(e) => {
            setIngredientType(e.target.value)
          }}
        >
          <option value="vegetables">Vegetables</option>
          <option value="spices">Spices and herbs</option>
          <option value="cereals">Cereals</option>
          <option value="meat">Meat</option>
          <option value="dairy">Dairy</option>
          <option value="fruits">Fruits</option>
          <option value="seafood">Seafood</option>
          <option value="powders">Powders</option>
          <option value="nuts">Nuts</option>
          <option value="oils">Oils</option>
          <option value="other">Other</option>
        </select>
        <button className="actionButton" onClick={onCreateIngredientSubmit}>
          Create
        </button>
      </div>
    )
  } else if (SelectedIngredient === undefined) {
    return (
      <div className="selectIngredient">
        <h1>Select Ingredient</h1>
        <button
          className="actionButton"
          onClick={() => {
            cancel()
          }}
        >
          Back
        </button>
        <input
          type="search"
          placeholder="Search"
          value={searchText}
          onChange={handleSearchChange}
        ></input>
        <button
          className="actionButton"
          onClick={() => setShowCreateIngredient(true)}
        >
          Create Ingredient
        </button>
        <div className="ingredientsContainer">
          {(searchText.length < 2 ? ingredients : searchIngredients).map(
            (ing) => (
              <button
                key={ing._id}
                onClick={() => {
                  setSelectedIngredient(ing)
                }}
              >
                {ing.name}
              </button>
            ),
          )}
        </div>
      </div>
    )
  } else {
    return (
      <div className="selectIngredient">
        <h2>Select Amount ({SelectedIngredient.name})</h2>
        <button
          className="actionButton"
          onClick={() => {
            setSelectedIngredient(undefined)
          }}
        >
          Back
        </button>
        <input
          type="number"
          placeholder="Amount"
          value={Amount}
          onChange={(event) => {
            setAmount(event.target.value)
          }}
        />
        <h3>Unit:</h3>
        <select
          value={Unit}
          onChange={(event) => {
            setUnit(event.target.value)
          }}
        >
          <option value=""></option>
          <option value="dL">dL</option>
          <option value="L">L</option>
          <option value="mL">mL</option>
          <option value="floz">fl oz</option>
          <option value="cup">cup</option>
          <option value="tbsp">tbsp</option>
          <option value="tsp">tsp</option>
          <option value="g">g</option>
          <option value="oz">oz</option>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
        <button className="actionButton" onClick={onAmountSubmit}>
          Done
        </button>
      </div>
    )
  }
}

export default SelectIngredient
