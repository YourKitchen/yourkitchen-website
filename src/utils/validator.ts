import { AllergenType, Recipe, RecipeType, Unit } from '@prisma/client'
import { getIngredientId } from '.'
import { extract, token_set_ratio } from 'fuzzball'

export class ValidationError extends Error {
  object: any

  constructor(msg: string, obj: any) {
    super(msg)

    this.object = obj
  }
}

const findBestMatch = (query: string, target: string) => {
  // Split the step by spaced
  const targetWords = target.split(' ')

  // Find the best place that the name fits
  const best = extract(query, targetWords, {
    scorer: token_set_ratio,
    cutoff: 90,
    returnObjects: true,
    sortBySimilarity: true,
  })

  if (best.length === 0) {
    return null
  }

  return best.map((match) => match.choice).join(' ')
}

export const validUnits = [
  'TEASPOON',
  'TABLESPOON',
  'FLUID_OUNCE',
  'CUP',
  'PINT',
  'QUART',
  'GALLON',
  'MILLILITER',
  'LITER',
  'GRAM',
  'KILOGRAM',
  'OUNCE',
  'POUND',
  'PINCH',
  'DASH',
  'DROP',
  'SLICE',
  'PIECE',
  'CLOVE',
  'BULB',
  'STICK',
  'CUBIC_INCH',
  'CUBIC_FOOT',
  'PACKAGE',
]

const validateIngredient = (
  ingredient: any,
): {
  id: string
  name: string
  unit: string
  amount: number
  allergenType: string | null
} => {
  const formattedIngredient: Partial<{
    id: string
    name: string
    unit: string
    amount: number
    allergenType: string | null
  }> = {}

  // Name
  if (ingredient.name && typeof ingredient.name === 'string') {
    formattedIngredient.name = ingredient.name
    formattedIngredient.id = getIngredientId(ingredient.name)
  } else {
    throw new ValidationError('ingredient."name" was not a string', ingredient)
  }

  // Amount
  if (ingredient.amount && typeof ingredient.amount === 'number') {
    formattedIngredient.amount = ingredient.amount
  } else {
    throw new ValidationError(
      'ingredient."amount" was not a number',
      ingredient,
    )
  }

  // Unit
  if (ingredient.unit && typeof ingredient.unit === 'string') {
    if (validUnits.includes(ingredient.unit)) {
      formattedIngredient.unit = ingredient.unit
    } else {
      const convertedUnit = convertUnitAbbreviationToFullName(ingredient.unit)
      if (convertedUnit) {
        formattedIngredient.unit = convertedUnit
      } else {
        throw new ValidationError(
          `ingredient."unit" was not valid (${ingredient.unit}). Valid values are ${validUnits}`,
          ingredient,
        )
      }
    }
  } else {
    throw new ValidationError('ingredient."unit" was not a string', ingredient)
  }

  // Allergen Type
  if (ingredient.allergenType && typeof ingredient.allergenType === 'string') {
    formattedIngredient.allergenType = ingredient.allergenType
  } else if (ingredient.allergenType) {
    // Check if it is defined, as it is optional
    throw new ValidationError(
      'ingredient."allergenType" was not a string',
      ingredient,
    )
  }

  return formattedIngredient as {
    id: string
    name: string
    unit: string
    amount: number
    allergenType: string | null
  }
}

function convertUnitAbbreviationToFullName(unitAbbreviation: string) {
  const tmpUnit = unitAbbreviation.toUpperCase().endsWith('S')
    ? unitAbbreviation
        .toUpperCase()
        .substring(0, -1) // Remove last character (It is just the plural form of the word most likely)
    : unitAbbreviation.toUpperCase()
  switch (tmpUnit) {
    case 'TSP':
      return 'TEASPOON'
    case 'TBSP':
      return 'TABLESPOON'
    case 'FL_OZ':
      return 'FLUID_OUNCE'
    case 'CUP':
      return 'CUP'
    case 'PT':
      return 'PINT'
    case 'QT':
      return 'QUART'
    case 'GAL':
      return 'GALLON'
    case 'ML':
      return 'MILLILITER'
    case 'L':
      return 'LITER'
    case 'G':
      return 'GRAM'
    case 'KG':
      return 'KILOGRAM'
    case 'OZ':
      return 'OUNCE'
    case 'LB':
      return 'POUND'
    case 'PINCH':
      return 'PINCH'
    case 'DASH':
      return 'DASH'
    case 'DROP':
      return 'DROP'
    case 'SLICE':
      return 'SLICE'
    case 'PIECE':
      return 'PIECE'
    case 'CLOVE':
      return 'CLOVE'
    case 'BULB':
      return 'BULB'
    case 'STICK':
      return 'STICK'
    case 'CU_IN':
      return 'CUBIC_INCH'
    case 'CU_FT':
      return 'CUBIC_FOOT'
    case 'PKG':
      return 'PACKAGE'
    default:
      return null
  }
}

const validateStep = (
  step: string,
  ingredients: {
    name: string
    unit: string
    amount: number
    allergenType: string | null
  }[],
): { content: string; numberOfIngredients: number } => {
  // Validate that all ingredients are valid.
  const stepSplit = step.split('!')
  let newSplit: string[] = []
  let numIngredients = 0

  // If % 2: 0 = description, 1 = ingredient
  let index = 0
  for (const split of stepSplit) {
    if (index % 2 === 1) {
      if (split === '') {
        // Skip, usually just sentence ending with !.
        continue
      }
      // Ingredient
      const colonSplit = split.split(':')
      if (colonSplit.length === 3) {
        // If there is the correct amount of :, continue validation
        const ingredientName = (colonSplit[2] as string).toLowerCase()

        const ingredient = ingredients.find((ingredient) => {
          const thisIngredientName = ingredient.name.toLowerCase()
          return (
            ingredientName.includes(thisIngredientName) ||
            thisIngredientName.includes(ingredientName)
          )
        })

        if (ingredient) {
          numIngredients += 1
          newSplit.push(
            `${ingredient.amount.toFixed(2)}:${
              ingredient.unit
            }:${ingredient.name.toLowerCase().replaceAll(' ', '-')}`,
          )
        } else {
          throw new ValidationError(
            `Could not find ingredient with name: ${ingredientName}`,
            {
              query: ingredientName,
              ingredients,
            },
          )
        }
      } else {
        // Try to fix it (Lookup ingredient name from the string and replace it from ingredients array).
        // Find the item in the colonSplit that is not a unit/amount.
        // If we get the ingredient name, we can find the correct amount in the ingredient list.
        let found = false
        for (const segment of colonSplit) {
          const ingredient = ingredients.findLast((ingredient) =>
            segment.includes(ingredient.name.toLowerCase()),
          )

          if (ingredient) {
            numIngredients += 1
            // We found the ingredient, we can now replace this split part with
            newSplit.push(
              `${ingredient.amount.toFixed(2)}:${
                ingredient.unit
              }:${getIngredientId(ingredient.name)}`,
            )
            found = true
            break
          }
        }
        if (!found) {
          // If the ingredient was not found in any part, throw.
          throw new ValidationError(
            `Could not find ingredientName in step split: '${split}'`,
            {
              stepPart: split,
              colonSplit,
              ingredients,
            },
          )
        }
      }
    } else {
      newSplit.push(split)
    }

    index++
  }

  if (numIngredients === 0) {
    // No ingredients where found in the step, try another method.
    // We go through each ingredient and find the best matches for the ingredients if there are any.
    let newStep = step
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i]
      const bestMatch = findBestMatch(ingredient.name, step)

      if (bestMatch !== null) {
        newStep = newStep.replace(
          bestMatch,
          `!${ingredient.amount.toFixed(2)}:${
            ingredient.unit
          }:${getIngredientId(ingredient.name)}!`,
        )
        numIngredients++
      }
    }
    newSplit = newStep.split('!')
  }

  return { content: newSplit.join('!'), numberOfIngredients: numIngredients }
}

export const validateContent = (
  content: any,
): Pick<
  Recipe & {
    ingredients: {
      id: string
      name: string
      unit: Unit
      amount: number
      allergenType: AllergenType | null
    }[]
  },
  | 'name'
  | 'mealType'
  | 'preparationTime'
  | 'cuisineName'
  | 'ingredients'
  | 'steps'
> => {
  const recipe: Partial<
    Pick<
      Recipe & {
        ingredients: {
          name: string
          unit: string
          amount: number
          allergenType: AllergenType | null
        }[]
      },
      | 'name'
      | 'mealType'
      | 'preparationTime'
      | 'cuisineName'
      | 'ingredients'
      | 'steps'
      | 'persons'
      | 'recipeType'
    >
  > = {}

  // Name
  if (content.name && typeof content.name === 'string') {
    recipe.name = content.name
  } else {
    if (content.recipeName && typeof content.recipeName === 'string') {
      recipe.name = content.recipeName
    } else {
      throw new ValidationError('"name" is not a string', content)
    }
  }

  // Meal Type
  if (content.mealType && typeof content.mealType === 'string') {
    const validMealTypes: Recipe['mealType'][] = [
      'BREAKFAST',
      'LUNCH',
      'DINNER',
    ]

    if (validMealTypes.includes(content.mealType)) {
      recipe.mealType = content.mealType
    } else {
      throw new ValidationError(
        '"mealType" was not "BREAKFAST", "LUNCH" or "DINNER"',
        content,
      )
    }
  } else {
    recipe.mealType = 'DINNER'
  }

  // Preparation Time
  if (content.preparationTime && typeof content.preparationTime === 'number') {
    recipe.preparationTime = content.preparationTime as number
  } else {
    throw new ValidationError('"preparationTime" is not a number', content)
  }

  // Cuisine
  if (content.cuisineName && typeof content.cuisineName === 'string') {
    recipe.cuisineName = content.cuisineName
  } else {
    throw new ValidationError('"cuisineName" is not a string', content)
  }

  // Ingredients
  if (content.ingredients && Array.isArray(content.ingredients)) {
    const ingredients = content.ingredients.map(validateIngredient)

    recipe.ingredients = ingredients

    // Steps (Steps requires ingredients)
    if (content.steps && Array.isArray(content.steps)) {
      let numIngredients = 0
      recipe.steps = content.steps.map((step: string) => {
        const formattedStep = validateStep(step, ingredients)

        numIngredients += formattedStep.numberOfIngredients

        return formattedStep.content
      })
      if (numIngredients === 0) {
        throw new ValidationError(
          '"steps" did not contain a single ingredient, indicating error.',
          content.steps,
        )
      }
    } else {
      throw new ValidationError('"steps" is not an array.', content.steps)
    }
  } else {
    throw new ValidationError('"ingredients" is not an array.', content)
  }

  if (typeof content.persons === 'string') {
    recipe.persons = Number.parseInt(
      content.persons.toString().match(/\d+/g)?.toString() ?? '4',
    )
  }
  if (typeof content.persons === 'number') {
    recipe.persons = content.persons
  }

  if (typeof content.recipeType === 'string') {
    // Validate the meal type value
    const validRecipeTypes = ['DESSERT', 'MAIN', 'SIDE', 'SNACK', 'STARTER']
    let parsedRecipeType = 'MAIN'

    // If it is an array, get the index of the value
    if (validRecipeTypes.includes(content.recipeType.toUpperCase())) {
      parsedRecipeType = content.recipeType
    }

    recipe.recipeType = parsedRecipeType as RecipeType
  }

  return recipe as Pick<
    Recipe & {
      ingredients: {
        id: string
        name: string
        unit: Unit
        amount: number
        allergenType: AllergenType | null
      }[]
    },
    | 'name'
    | 'mealType'
    | 'preparationTime'
    | 'cuisineName'
    | 'ingredients'
    | 'steps'
    | 'persons'
    | 'recipeType'
  >
}
