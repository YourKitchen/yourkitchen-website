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
        console.log(response)
        console.warn(
          `Unable to find nutrient information for ${ingredient.name}`,
        )
        continue
      }

      const text = response.pods[0].subpods[0].plaintext
      const splittext = text.split('\n')

      const regexResult = splittext.map((subtext) => {
        const text = subtext.trim()
        const regex = /([\w\s]+) (\d+) ?([\w\%]+) \| [\w ]*(\d+)%/gi
        return regex.exec(text)
      })

      for (const nutrient of regexResult) {
        if (!nutrient) {
          continue
        }
        const name = nutrient[1].trim()
        const amount = Number.parseFloat(nutrient[2])
        const unit = nutrient[3]
        const percentage = Number.parseInt(nutrient[4]) / 100.0

        nutrients.push({
          ingredientId: ingredient.id,

          nutrientId: getIngredientId(name),

          name,
          amount,
          unit,
          percentage,
        })
      }
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
