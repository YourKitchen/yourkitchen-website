import {
  AllergenType,
  Ingredient,
  Recipe,
  RecipeImage,
  Unit,
} from '@prisma/client'
import { put } from '@vercel/blob'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'
import { api } from '#network/index'
import prisma from '#pages/api/_base'
import { getRecipeImage } from '#pages/api/_recipeImage'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // VALIDATE CRON SECRET
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }

  if (req.method === 'POST') {
    await handlePOST(req, res)
  } else {
    res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    })
  }
}

const openai = new OpenAI()

const validateIngredient = (
  ingredient: any,
): {
  name: string
  unit: string
  amount: number
  allergenType: string | null
} => {
  const formattedIngredient: Partial<{
    name: string
    unit: string
    amount: number
    allergenType: string | null
  }> = {}

  // Name
  if (ingredient.name && typeof ingredient.name === 'string') {
    formattedIngredient.name = ingredient.name
  } else {
    throw new Error('Validation Error: ingredient."name" was not a string')
  }

  // Amount
  if (ingredient.amount && typeof ingredient.amount === 'number') {
    formattedIngredient.amount = ingredient.amount
  } else {
    throw new Error('Validation Error: ingredient."amount" was not a number')
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
      throw new Error(
        `Validation Error: ingredient."unit" was not valid (${ingredient.unit}). Valid values are ${validUnits}`,
      )
    }
  } else {
    throw new Error('Validation Error: ingredient."unit" was not a string')
  }

  // Allergen Type
  if (ingredient.allergenType && typeof ingredient.allergenType === 'string') {
    formattedIngredient.allergenType = ingredient.allergenType
  } else if (ingredient.allergenType) {
    // Check if it is defined, as it is optional
    throw new Error(
      'Validation Error: ingredient."allergenType" was not a string',
    )
  }

  return formattedIngredient as {
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
          throw new Error(
            `Validation Error: Could not find ingredient with name: ${ingredientName}`,
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
          throw new Error(
            `Validation Error: Could not find ingredientName in step split: ${split}`,
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

const validateContent = (
  content: any,
): Pick<
  Recipe & {
    ingredients: {
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
    throw new Error('Validation failed: "name" is not a string')
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
      throw new Error(
        'Validation failed: "mealType" was not "BREAKFAST", "LUNCH" or "DINNER"',
      )
    }
  } else {
    throw new Error('Validation failed: "mealType" is not a string')
  }

  // Preparation Time
  if (content.preparationTime && typeof content.preparationTime === 'number') {
    recipe.preparationTime = content.preparationTime as number
  } else {
    throw new Error('Validation failed: "preparationTime" is not a number')
  }

  // Cuisine
  if (content.cuisineName && typeof content.cuisineName === 'string') {
    recipe.cuisineName = content.cuisineName
  } else {
    throw new Error('Validation failed: "cuisineName" is not a string')
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
      throw new Error('Validation failed: "steps" is not an array.')
    }
  } else {
    throw new Error('Validation failed: "ingredients" is not an array.')
  }

  return recipe as Pick<
    Recipe & {
      ingredients: {
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

const getAndStoreImage = async (
  name: string,
): Promise<Omit<RecipeImage, 'recipeId'>> => {
  // Get image for recipe.
  const image = await getRecipeImage(name)

  console.log(name)

  const blobResponse = await api.get(image.src.medium, {
    responseType: 'blob',
  }) // Upload medium

  // Upload to blob storage.
  const blob = await put(
    `recipes/${image.id}-${name.toLowerCase().replaceAll(' ', '-')}.jpeg`,
    new Blob([blobResponse.data]),
    {
      access: 'public',
    },
  )

  return {
    link: blob.url,
    photoRefUrl: image.url,
    photographer: image.photographer,
    photographerUrl: image.photographer_url,
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a chef writing a cookbook. The output should be outputted in the following json format:
          {
            "name": string,
            "mealType": 'BREAKFAST' | 'LUNCH' | 'DINNER',
            "preparationTime": number, // Number of minutes
            "difficulty": 'EASY' | 'INTERMEDIATE' | 'EXPERT',
            "cuisineName": string,
            "ingredients": {
               "unit": 'TEASPOON' | 'TABLESPOON' | 'FLUID_OUNCE' | 'CUP' | 'PINT' | 'QUART' | 'GALLON' | 'MILLILITER' | 'LITER' | 'GRAM' | 'KILOGRAM' | 'OUNCE' | 'POUND' | 'PINCH' | 'DASH' | 'DROP' | 'SLICE' | 'PIECE' | 'CLOVE' | 'BULB' | 'STICK' | 'CUBIC_INCH' | 'CUBIC_FOOT' | 'PACKAGE',
               "amount": number,
               "name": string,
               "allergenType": 'NUT' | 'PEANUTS' | 'LACTOSE' | 'EGGS' | 'FISH' | 'SHELLFISH' | 'SOY' | 'WHEAT' | 'GLUTEN' | 'SESAME' | 'MUSTARD' | 'SULFITES' | 'CELERY' | 'LUPIN' | 'MOLLUSKUS' | null}[],
            "steps": string[]
          }

           The steps should be generated in a specific manner where every time an ingredient is mentioned it will be using the following format:
           !amount:unit:name! these three values should come from the ingredients array. An example could look like this:
           "Add the minced !2:cloves:garlic! and sauté for another minute." if the provided ingredient is {"unit": "cloves", "amount": 2, "name": "Garlic"}.`,
        },
        {
          role: 'user',
          content: `Generate a recipe that would fit well with the ingredients available in Denmark in ${
            DateTime.utc().monthLong
          }`,
        },
      ],
      model: 'gpt-3.5-turbo-1106',
      response_format: { type: 'json_object' },
    })
    const response = completion.choices[0].message.content

    if (response) {
      // If we have a response, apply the validator to check that the everything is in the correct format.
      const recipe = validateContent(response)

      const [recipeImage] = await Promise.all([
        getAndStoreImage(recipe.name),
        // Upsert all the ingredients.
        prisma.ingredient.createMany({
          data: recipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            allergenTypes: ingredient.allergenType
              ? [ingredient.allergenType]
              : [],
          })),
          skipDuplicates: true,
        }),
        // Upsert cuisine if it does not exist
        prisma.cuisine.createMany({
          data: {
            name: recipe.cuisineName,
          },
          skipDuplicates: true,
        }),
      ])

      console.log(recipeImage)

      // Add the recipe to the db.
      const createResponse = await prisma.recipe.create({
        data: {
          name: recipe.name,
          mealType: recipe.mealType,
          preparationTime: recipe.preparationTime,
          recipeType: 'MAIN',
          ingredients: {
            // RecipeIngredients have to be created individually for each recipe.
            createMany: {
              data: recipe.ingredients.map((ingredient) => ({
                ingredientName: ingredient.name,
                amount: ingredient.amount,
                unit: ingredient.unit,
              })),
            },
          },
          steps: recipe.steps,
          ownerId: '6adc2bb1-a407-4493-aefa-565b0276d4a1', // YourKitchen Bot
          cuisineName: recipe.cuisineName,
          image: {
            createMany: {
              data: [recipeImage],
              skipDuplicates: true,
            },
          },
        },
      })

      // TODO: Send newsletter to user.
      console.log(createResponse)

      return res.json({ ok: true, message: 'Recipe added.' })
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message ?? err,
      code: err.code,
      stack: err.stack,
    })
  }
  res.status(500).json({ ok: false, message: 'An unknown error occurred' })
}

export default handler
