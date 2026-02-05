import { put } from '@vercel/blob'
import { OpenAI } from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import type { RecipeImage } from 'prisma/generated/prisma/client'
import { ValidationError, validateContent } from 'src/utils/validator'
import { v4 } from 'uuid'
import { getRecipeImage } from '#misc/recipeImage'
import { validatePermissions } from '#misc/utils'
import { api } from '#network/index'
import prisma from '#prisma'
import randomSchema from '#utils/random_schema.json'

export const maxDuration = 60

const openai = new OpenAI()

const getAndStoreImage = async (
  name: string,
  recipeId: string,
): Promise<Omit<RecipeImage, 'recipeId'>> => {
  // Get image for recipe.
  const images = await getRecipeImage(name)
  const image = images[0]

  const blobResponse = await api.get(image.src.medium, {
    responseType: 'arraybuffer',
  }) // Upload medium

  const blob = new Blob([blobResponse.data], {
    type: blobResponse.headers['content-type'],
  })

  // Upload to blob storage.
  const imageBlob = await put(`recipes/${recipeId}/${image.id}.jpg`, blob, {
    access: 'public',
    contentType: blobResponse.headers['Content-Type']?.toString(),
  })

  return {
    id: v4(),
    link: imageBlob.url,
    photoRefUrl: image.url,
    photographer: image.photographer,
    photographerUrl: image.photographer_url,
  }
}

export const GET = validatePermissions(
  {
    permissions: false,
    bypass: (req) =>
      req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`,
  },
  async (_req) => {
    try {
      const ingredientsCount = await prisma.ingredient.count()

      const randomNumbers = [
        Math.floor(Math.random() * (ingredientsCount - 1)),
        Math.floor(Math.random() * (ingredientsCount - 1)),
        Math.floor(Math.random() * (ingredientsCount - 1)),
      ]

      const randomIngredients = await Promise.all(
        randomNumbers.map((ingredientIndex) =>
          prisma.ingredient.findMany({
            take: 1,
            skip: ingredientIndex,
          }),
        ),
      )

      const flatRandomIngredients = randomIngredients.flat(1)

      const conversations: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a chef writing a cookbook. 
      You should use one of the following three ingredients: ${flatRandomIngredients.map((ingredient) => ingredient.name)}
      
      The structure of the response should follow the following json schema as closely as possible:
      ${randomSchema}

      If the recipe does not follow this format exactly it is invalid.
      The main required fields on the root level of the JSON structure is:
      "name", "mealType", "preparationTime", "difficulty", "cuisineName", "steps"
      These fields are required for the output to be valid.

      "mealType" can have one of the following values "BREAKFAST", "LUNCH", "DINNER"
      "preparationTime" should be a number, signifying the number of minutes it takes to cook the dish. For example 1.5 hours should equal a value of 90.
      "difficulty" can have one of the following values "EASY", "INTERMEDIATE", "EXPERT"
      "steps" should contains a string array, that describes the steps neccesary to create the dish. 

      The steps should be generated in a specific manner where every time an ingredient is mentioned it will be using the following format:
      !amount:unit:name! these three values should come from the ingredients array. An example could look like this:
      "Add the minced !2:CLOVE:garlic! and sauté for another minute." if the ingredient is {"unit": "clove", "amount": 2, "name": "Garlic"}.
      If an ingredient is mentioned more than once in the steps, it should only be marked with the above format once.
      
      Valid units are as follows: TEASPOON,TABLESPOON,FLUID_OUNCE,CUP,PINT,QUART,GALLON,MILLILITER,LITER,GRAM,KILOGRAM,OUNCE,POUND,PINCH,DASH,DROP,SLICE,PIECE,CLOVE,BULB,STICK,CUBIC_INCH,CUBIC_FOOT,PACKAGE`,
        },
      ]

      const sendMessageToGPT = async (newMessage: string) => {
        conversations.push({
          role: 'user',
          content: newMessage,
        })

        const completion = await openai.chat.completions.create({
          messages: conversations,
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
        })

        const message = completion.choices[0].message

        conversations.push(message)

        return message.content
      }

      const response = await sendMessageToGPT(
        'Generate a recipe using the provided instructions.',
      )

      if (response !== null) {
        const parsedContent = JSON.parse(response)

        const validateRecipe = async (content: any, retriesUsed = 0) => {
          try {
            // If we have a response, apply the validator to check that the everything is in the correct format.
            const recipe = validateContent(content)

            if (retriesUsed > 0) {
              console.debug(`Got the recipe on attempt no. ${retriesUsed}`)
            }

            return recipe
          } catch (err) {
            if (retriesUsed < 3) {
              // Send the message to the GPT
              console.debug(
                `Sending message to GPT: The format of the recipe was invalid. The error was: ${err.message ?? err}`,
              )
              console.debug(
                `The previous response looked like this: ${JSON.stringify(content, null, 2)}`,
              )
              const newResponse = await sendMessageToGPT(
                `The format of the recipe was invalid. The error was: ${err.message ?? err}`,
              )
              if (!newResponse) {
                throw new Error('Got invalid response from GPT')
              }
              return validateRecipe(JSON.parse(newResponse), retriesUsed + 1)
            }
            console.error('Failed to get the recipe in 3 attempts')
            throw err
          }
        }

        const recipe = await validateRecipe(parsedContent)

        const recipeId = v4()

        const [recipeImage] = await Promise.all([
          getAndStoreImage(recipe.name, recipeId),
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
        const _createResponse = await prisma.recipe.create({
          data: {
            id: recipeId,
            name: recipe.name,
            mealType: recipe.mealType,
            preparationTime: recipe.preparationTime,
            recipeType: 'MAIN',
            ingredients: {
              // There is a difference between the ingredients generated here, and above.
              // The ones generated above is of type Ingredient, the ones geneated here is RecipeIngredients, which contains amount & unit.
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

        return Response.json({ ok: true, message: 'Recipe added.' })
      }
      return Response.json(
        {
          ok: false,
          message: 'Unable to get response from AI',
        },
        {
          status: 500,
        },
      )
    } catch (err) {
      return Response.json(
        {
          ok: false,
          message: err.message ?? err,
          code: err.code,
          stack: err.stack,
          recipe: err instanceof ValidationError ? err.object : undefined,
        },
        { status: 500 },
      )
    }
  },
)
