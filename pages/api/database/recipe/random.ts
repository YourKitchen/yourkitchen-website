import { api } from '#network/index'
import prisma from '#pages/api/_base'
import { getRecipeImage } from '#pages/api/_recipeImage'
import { RecipeImage } from '@prisma/client'
import { put } from '@vercel/blob'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'
import { ValidationError, validateContent } from 'src/utils/validator'
import { v4 } from 'uuid'

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

const getAndStoreImage = async (
  name: string,
): Promise<Omit<RecipeImage, 'recipeId'>> => {
  // Get image for recipe.
  const image = await getRecipeImage(name)

  const blobResponse = await api.get(image.src.medium, {
    responseType: 'blob',
  }) // Upload medium

  // Upload to blob storage.
  const blob = await put(
    `recipes/${image.id}-${name.toLowerCase().replaceAll(' ', '-')}.jpg`,
    new Blob([blobResponse.data], {
      type: blobResponse.headers['Content-Type']?.toString(),
    }),
    {
      access: 'public',
      contentType: blobResponse.headers['Content-Type']?.toString(),
    },
  )

  return {
    id: v4(),
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
      const recipe = validateContent(JSON.parse(response))

      const [recipeImage] = await Promise.all([
        getAndStoreImage(recipe.name),
        // Upsert all the ingredients.
        prisma.ingredient.createMany({
          data: recipe.ingredients.map((ingredient) => ({
            id: ingredient.id,
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
                ingredientId: ingredient.id,
                amount: ingredient.amount,
                unit: ingredient.unit,
              })),
            },
          },
          steps: recipe.steps,
          ownerId: 'f42520b2-c709-4f5e-adfc-c09cd06231a9', // YourKitchen Bot
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
      // Use the createResponse to send the newsletter.

      return res.json({ ok: true, message: 'Recipe added.' })
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message ?? err,
      code: err.code,
      stack: err.stack,
      recipe: err instanceof ValidationError ? err.object : undefined,
    })
  }
  res.status(500).json({ ok: false, message: 'An unknown error occurred' })
}

export default handler
