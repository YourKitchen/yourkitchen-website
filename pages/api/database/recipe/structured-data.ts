import {
  MealType,
  Recipe,
  RecipeImage,
  RecipeIngredient,
  RecipeType,
} from '@prisma/client'
import axios from 'axios'
import { parseHTML } from 'html-recipe-parser'
import { IRecipe } from 'html-recipe-parser/dist/interfaces'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'
import { RecipeJsonLdProps } from 'next-seo'
import { NextRequest, NextResponse } from 'next/server'
import { v4 } from 'uuid'
import prisma from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { validUnits, validateContent } from '#utils/validator'
import { getIngredientId } from '#utils/index'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'You need to be logged in to do this',
      })
      return
    }

    await handleGET(req, res, undefined)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message || err })
  }
}

const parseHumanizedTime = (time: string) => {
  const parts = time.split(', ')

  return parts.reduce((prev, cur) => {
    const amount = cur.split(' ')[0]
    const parsedAmount = Number.parseInt(amount)
    if (cur.includes('day')) {
      return prev + 60 * 24 * parsedAmount
    }
    if (cur.includes('hour')) {
      return prev + 60 * parsedAmount
    }
    if (cur.includes('minute')) {
      return prev + 1 * parsedAmount
    }
    return prev
  }, 0)
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session?: Session,
) => {
  const content = req.query.content

  if (!content || typeof content !== 'string') {
    res.status(400).json({
      ok: false,
      message: "'content' is not valid",
    })
    return
  }

  const parsedRecipe = await parseHTML(content)

  if (typeof parsedRecipe === 'string') {
    throw new Error(parsedRecipe)
  }

  // Validate the meal type value
  const validMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER']
  let parsedMealType = 'DINNER'

  if (parsedRecipe.category) {
    // If it is an array, get the index of the value
    const value = parsedRecipe.category.find((mealType) =>
      validMealTypes.includes(mealType.toUpperCase()),
    )

    if (value) {
      parsedMealType = value.toUpperCase()
    }
  }

  // Validate the meal type value
  const validRecipeTypes = ['DESSERT', 'MAIN', 'SIDE', 'SNACK', 'STARTER']
  let parsedRecipeType = 'MAIN'

  if (parsedRecipe.category) {
    // If it is an array, get the index of the value
    const value = parsedRecipe.category.find((recipeType) =>
      validRecipeTypes.includes(recipeType.toUpperCase()),
    )

    if (value) {
      parsedRecipeType = value.toUpperCase()
    }
  }

  let parsedCuisine: string | undefined
  if (Array.isArray(parsedRecipe.cuisine) && parsedRecipe.cuisine.length) {
    parsedCuisine = parsedRecipe.cuisine[0]
  }
  if (!parsedCuisine) {
    throw new Error('Unable to parse cuisine')
  }

  const id = v4()
  const recipe: Partial<
    Recipe & {
      ingredients: { name: string; unit: string; amount: number }[]
      image: RecipeImage[]
    }
  > = {
    id,
    name: parsedRecipe.name,
    cuisineName: parsedCuisine as string,
    description: null,
    mealType: parsedMealType as MealType,
    persons: parsedRecipe.yeld
      ? Number.parseInt(
          parsedRecipe.yeld.toString().match(/\d+/g)?.toString() ?? '4',
        ) || 4
      : 4,
    ingredients: parsedRecipe.ingredients?.map((ingredient) => {
      const lowercaseUnits = validUnits.map((unit) => unit.toLowerCase())

      const unit = lowercaseUnits.find((unit) => {
        return ingredient.split(unit).length === 2
      })

      if (unit) {
        const [amount, name] = ingredient.split(unit)

        const formattedName = name.startsWith('s ') ? name.slice(2) : name

        return {
          id: getIngredientId(formattedName.trim()),
          name: formattedName.trim(),
          amount: Number.parseFloat(amount),
          unit: unit.toUpperCase(),
        }
      }
      const split = ingredient.split(' ')
      const amount = Number.parseFloat(split[0])

      let name = ''
      for (let i = 1; i < split.length; i++) {
        name += ` ${split[i]}`
      }

      return {
        id: getIngredientId(name.trim()),
        name: name.trim(),
        amount: amount,
        unit: 'PIECE',
      }
    }),
    ownerId: session?.user.id,
    recipeType: parsedRecipeType as RecipeType,

    preparationTime: parsedRecipe.totalTime
      ? parseHumanizedTime(parsedRecipe.totalTime)
      : undefined,

    image: parsedRecipe.imageUrl
      ? [
          {
            id: v4(),
            photoRefUrl: parsedRecipe.imageUrl,
            photographerUrl: null,
            link: parsedRecipe.imageUrl,
            photographer: parsedRecipe.author ?? session?.user.name ?? '',
            recipeId: id,
          },
        ]
      : [],
    steps: parsedRecipe.instructions,
    created: parsedRecipe.datePublished
      ? new Date(parsedRecipe.datePublished)
      : new Date(),
    updated: new Date(),
  }

  res.json({
    ok: true,
    message: 'Successfully got recipe',
    data: validateContent(recipe),
  })
}

export default handler
