import prisma from '#pages/api/_base'
import { getIngredientId } from '#utils/index'
import type { Nutrient } from '@prisma/client'
import WolframAlphaAPI from '@wolfram-alpha/wolfram-alpha-api'
import type { NextApiRequest, NextApiResponse } from 'next'

export const maxDuration = 60

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

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: {
        NOT: {
          // Find ingredients where the nutrients are not defined yet.
          nutrients: {
            some: {
              amount: {
                gt: 0,
              },
            },
          },
        },
      },
      take: 5,
    })

    console.log(ingredients.length)

    const nutrients: Nutrient[] = []

    for (const ingredient of ingredients) {
      // For each ingredient make an api call to wolfram alpha and get the nutrients
      const getResponse = async (input: string) => {
        const waApi = WolframAlphaAPI(
          process.env.WOLFRAM_ALPHA_APP_ID ?? 'undef',
        )

        return waApi.getFull({
          input,
          includepodid: 'NutritionLabelSingle:ExpandedFoodData',
          format: 'plaintext',
        })
      }

      let response = await getResponse(`${ingredient.name} nutrients`)

      if (response.didyoumeans) {
        const didyoumeans = Array.isArray(response.didyoumeans)
          ? response.didyoumeans
          : [response.didyoumeans]
        // Find the one that still contains nutrients
        let newInput = didyoumeans.find((didyourmean) =>
          didyourmean.val.includes('nutrients'),
        )

        if (!newInput) {
          // Find the one that has the highest score (index 0)
          newInput = didyoumeans[0]
        }
        console.log(`Trying to get new response with ${newInput.val}`)
        response = await getResponse(newInput.val)
      }

      if (response.numpods === 0) {
        console.warn(
          `Unable to find nutrient information for ${ingredient.name}`,
        )
        continue
      }

      const text = response.pods[0].subpods[0].plaintext
      const splittext = text.split('\n')

      const ingredientNutrients = splittext.flatMap((subtext) => {
        const text = subtext.trim()
        const regex1 = /([\w\s]+) (\d+) ?([\w\%]+) \| (\d+)%/gi
        const result1 = regex1.exec(text)

        if (result1) {
          const name = result1[1].trim()
          const amount = Number.parseFloat(result1[2])
          const unit = result1[3]
          const percentage = Number.parseInt(result1[4]) / 100.0
          return {
            ingredientId: ingredient.id,

            nutrientId: getIngredientId(name),

            name,
            amount,
            unit,
            percentage,
          }
        }

        // Attempt the second regex
        const subtexts = text.split('|') // Split by |, because it might contain two types of vitamins.
        const results: Nutrient[] = []

        for (const subtext of subtexts) {
          const regex2 = /([\w\s ]+) (\d+)%/gi
          const result2 = regex2.exec(subtext.trim())

          if (result2) {
            const name = result2[1].trim()
            const percentage = Number.parseInt(result2[2]) / 100.0
            if (name.length === 1) {
              // Invalid, usually because the parsing failed
              throw new Error(
                `The parsing of "${subtext}" failed, name was "${name}", percentage: "${percentage}"`,
              )
            }

            results.push({
              ingredientId: ingredient.id,

              nutrientId: getIngredientId(name),

              name,
              amount: null,
              unit: null,
              percentage,
            })
          }
        }
        if (results.length > 0) {
          return results
        }

        // Last attempt is the calories line
        const regex3 = /calories (\d+)/g
        const result3 = regex3.exec(text)

        if (result3) {
          const calories = result3[1]

          const parsedCalories = Number(calories)
          const percentage = parsedCalories / 2000.0 // The reference diet is 2000 calories per day

          return {
            ingredientId: ingredient.id,

            nutrientId: 'calories',

            name: 'calories',
            amount: parsedCalories,
            unit: 'kcal',
            percentage,
          }
        }

        return null
      })

      nutrients.push(
        ...ingredientNutrients.filter((nutrient) => nutrient !== null),
      )
    }

    // Upload the results
    const createResponse = await prisma.nutrient.createMany({
      data: nutrients,
      skipDuplicates: true,
    })

    res.json({
      ok: true,
      message: `Succesfully set ${createResponse.count} nutrient data for ${ingredients.length} new ingredients`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
  }
}

export default handler
