import { AllergenType, Recipe, Unit } from '@prisma/client'
import { getIngredientId } from '.'

export class ValidationError extends Error {
  object: any

  constructor(msg: string, obj: any) {
    super(msg)

    this.object = obj
  }
}

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
    const validUnits = [
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
    if (validUnits.includes(ingredient.unit)) {
      formattedIngredient.unit = ingredient.unit
    } else {
      throw new ValidationError(
        `ingredient."unit" was not valid (${ingredient.unit}). Valid values are ${validUnits}`,
        ingredient,
      )
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

const validateStep = (
  step: string,
  ingredients: {
    name: string
    unit: string
    amount: number
    allergenType: string | null
  }[],
): string => {
  // Validate that all ingredients are valid.
  const stepSplit = step.split('!')
  const newSplit: string[] = []

  // If % 2: 0 = description, 1 = ingredient
  let index = 0
  for (const split of stepSplit) {
    if (index % 2 === 1) {
      if (split === '') {
        // Skip, usually just sentance ending with !.
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
          newSplit.push(
            `${ingredient.amount}:${ingredient.unit}:${ingredient.name
              .toLowerCase()
              .replaceAll(' ', '-')}`,
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
            // We found the ingredient, we can now replace this split part with
            newSplit.push(
              `${ingredient.amount}:${ingredient.unit}:${ingredient.name
                .toLowerCase()
                .replaceAll(' ', '-')}`,
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

  return newSplit.join('!')
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
    >
  > = {}

  // Name
  if (content.name && typeof content.name === 'string') {
    recipe.name = content.name
  } else {
    throw new ValidationError('"name" is not a string', content)
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
    throw new ValidationError('"mealType" is not a string', content)
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
      recipe.steps = content.steps.map((step: string) =>
        validateStep(step, ingredients),
      )
    } else {
      throw new ValidationError('"steps" is not an array.', content)
    }
  } else {
    throw new ValidationError('"ingredients" is not an array.', content)
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
  >
}
