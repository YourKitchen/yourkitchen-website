import AdapterMoment from '@mui/lab/AdapterMoment'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { api, feeditemCreateOne, recipeCreateOne } from '@yourkitchen/common'
import { FeedItem, Ingredient, Recipe } from '@yourkitchen/models'
import React from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../../../../Contexts/AuthContext'
import './AddRecipePage.css'
import CuisineContainer from './Containers/CuisineContainer'
import MealTypeContainer from './Containers/MealTypeContainer'
import PersonsContainer from './Containers/PersonsContainer'
import RecipeTypeContainer from './Containers/RecipeTypeContainer'
// Time
import FileInput from './Helpers/FileInput'
import SelectIngredient from './SelectIngredient'

const AddRecipePage: React.FC = () => {
  // Context
  const authContext = React.useContext(AuthContext)
  const navigate = useNavigate()

  const [recipe, setRecipe] = React.useState<Recipe>({
    _id: '',
    description: '',
    image: '',
    ingredients: [],
    name: '',
    ownerId: 'none', // Gonna be set by server anyways
    persons: 4,
    preparationTime: { hours: 0, minutes: 30 },
    rating: 0,
    recipeType: 'main',
    cuisine: 'american',
    mealType: 'dinner',
    steps: [],
    created_at: new Date(),
    updated_at: new Date(),
  })

  const [stepInput, setStepInput] = React.useState('')
  const [image, setImage] = React.useState<File>()

  // View state
  const [preview, setPreview] = React.useState<string | undefined>()
  const [selectIngredientIndex, setSelectIngredientIndex] = React.useState<
    number | undefined
  >()
  const [showSelectIngredients, setShowSelectIngredients] =
    React.useState(false)

  React.useEffect(() => {
    if (recipe.recipeType !== 'main') {
      setRecipe((prev) => ({ ...prev, mealType: 'dinner' }))
    }
  }, [recipe.recipeType])

  React.useEffect(() => {
    if (!image) {
      setPreview(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(image)
    setPreview(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [image])

  React.useEffect(() => {
    if (!authContext.authenticated) {
      navigate('/')
    }
    document.title = 'Add Recipe | YourKitchen'
  }, [authContext.authenticated])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    switch (event.target.name) {
      case 'name':
        setRecipe((prev) => ({ ...prev, name: value }))
        break
      case 'description':
        setRecipe((prev) => ({ ...prev, description: value }))
        break
      default:
        console.error('Name not found')
        break
    }
  }

  const handleTimeChange = (date: Date) => {
    if (!date) {
      return
    }

    setRecipe((prev) => ({
      ...prev,
      preparationTime: { hours: date.getHours(), minutes: date.getMinutes() },
    }))
  }

  const addStep = (value: string) => {
    if (value === '') {
      return
    }
    setRecipe((prev) => ({ ...prev, steps: [...prev.steps, value] }))
    setStepInput('')
  }
  const removeStep = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))
  }

  const removeIngredient = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const addIngredient = () => {
    const ingredient: any = {
      _id: 'none',
      name: '',
      type: '',
      count: 0,
    }
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient],
    }))
  }

  const onIngredientSelected = (ingredient: Ingredient) => {
    if (!selectIngredientIndex) {
      return
    }
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((prevIngredient, index) =>
        index === selectIngredientIndex ? ingredient : prevIngredient,
      ),
    }))
    setSelectIngredientIndex(undefined)
    setShowSelectIngredients(false)
  }

  const handleStepChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
  ) => {
    setRecipe((prev) => ({
      ...prev,
      steps: prev.steps.map((step, index) =>
        index === i ? e.target.value : step,
      ),
    }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addStep(stepInput)
    }
  }

  const handleSubmit = async () => {
    if (!authContext.user) {
      return
    }
    if (recipe.name === '') {
      alert('You need to input a name')
    }
    if (recipe.description === '') {
      alert('You need to input a description')
    }
    if (!recipe.preparationTime) {
      return
    }
    if (
      recipe.preparationTime?.hours === 0 &&
      recipe.preparationTime?.minutes === 0
    ) {
      alert('You need to select a preparation time higher than 00:00')
      return
    }
    if (!image) {
      alert('You need to upload a picture of your recipe')
      return
    }
    if (recipe.ingredients.length === 0) {
      alert('You need at least one ingredient')
      return
    }
    if (recipe.steps.length === 0) {
      alert('You need at least one step')
      return
    }
    if (!authContext.user) {
      alert("You aren't logged in")
      return
    }
    // //Precheck done, construct recipe and submit
    const formData = new FormData()
    formData.append('file', image)
    const uploadImageData = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const imageName = uploadImageData.data.filename || ''

    const tmpRecipe = recipe
    tmpRecipe.image = imageName
    const response = await recipeCreateOne(tmpRecipe)
    const recipeId = response.recordId
    if (recipeId) {
      tmpRecipe._id = recipeId
      const feedItem: Partial<FeedItem> = {
        description: '',
        recipe: response.record,
      }

      await feeditemCreateOne(feedItem)

      // await feedItem.reference.set(feedItem);
      navigate('/recipe/' + recipeId) // Show them the recipe they just created
    } else {
      console.log(response)
    }
  }

  if (showSelectIngredients) {
    return (
      <SelectIngredient
        cancel={() => {
          setShowSelectIngredients(false)
        }}
        callback={onIngredientSelected}
      />
    )
  } else {
    return (
      <div className="addRecipePage">
        <h1>Add Recipe</h1>
        <input
          name="name"
          placeholder="Name"
          type="text"
          value={recipe.name}
          onChange={handleInputChange}
        />
        <input
          name="description"
          placeholder="Description"
          type="text"
          value={recipe.description}
          onChange={handleInputChange}
        />

        <LocalizationProvider dateAdapter={AdapterMoment}>
          <TimePicker
            value={
              new Date(
                0,
                0,
                0,
                recipe.preparationTime.hours,
                recipe.preparationTime.minutes,
              )
            }
            ampm={false}
            onChange={(time) => {
              if (!time) {
                return
              }
              handleTimeChange(time)
            }}
          />
        </LocalizationProvider>
        <h3>Image:</h3>
        <FileInput value={image} onChange={setImage} accept="image/*" />
        {preview && <img alt="Preview" className="preview" src={preview} />}
        <RecipeTypeContainer
          recipeType={recipe.recipeType}
          setRecipeType={(value) => {
            setRecipe((prev) => ({ ...prev, recipeType: value }))
          }}
        />
        {recipe.recipeType === 'main' && (
          <MealTypeContainer
            mealType={recipe.mealType}
            setMealType={(value) => {
              setRecipe((prev) => ({ ...prev, mealType: value }))
            }}
          />
        )}
        <CuisineContainer
          cuisine={recipe.cuisine}
          setCuisine={(value) => {
            setRecipe((prev) => ({ ...prev, cuisine: value }))
          }}
        />
        <PersonsContainer
          persons={recipe.persons}
          setPersons={(value) => {
            setRecipe((prev) => ({ ...prev, persons: value }))
          }}
        />
        <h3>Ingredients:</h3>
        <div className="ingredientsContainer">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={ingredient._id + index} className="ingredientRow">
              <button
                className="selectIngredientButton"
                onClick={() => {
                  setSelectIngredientIndex(index)
                  setShowSelectIngredients(true)
                }}
              >
                {ingredient._id === 'none'
                  ? 'Select Ingredient'
                  : (ingredient.amount ? ingredient.amount : 0).toString() +
                    ingredient.unit +
                    '  -  ' +
                    ingredient.name}
              </button>
              <button
                className="removeIngredient"
                onClick={() => removeIngredient(index)}
              ></button>
            </div>
          ))}
        </div>
        <button className="actionButton" onClick={addIngredient}>
          Add Ingredient
        </button>
        <h3>Steps:</h3>
        <div className="stepsContainer">
          {recipe.steps.map((step, index) => (
            <div key={index} className="stepRow">
              <input
                autoComplete="off"
                autoCorrect="off"
                key={'input' + index}
                name={step}
                type="text"
                placeholder="Step description"
                value={step}
                onChange={(e) => handleStepChange(e, index)}
              />
              <button
                className="removeStep"
                onClick={() => {
                  removeStep(index)
                }}
              ></button>
            </div>
          ))}
        </div>
        <input
          placeholder="Step description"
          name="stepInput"
          type="text"
          value={stepInput}
          onChange={(event) => {
            setStepInput(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          onBlur={(event) => addStep(event.target.value)}
        />
        <button className="actionButton" onClick={handleSubmit}>
          Done
        </button>
      </div>
    )
  }
}

export default AddRecipePage
