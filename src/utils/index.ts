import { RecipeIngredient, Unit } from '@prisma/client'

export const toTitleCase = () => {}

export const getIngredientId = (name: string): string => {
  return name
    .toLowerCase()
    .replaceAll(/ ?\(.*/g, '')
    .replaceAll(/[^\w\d\s]/g, '')
    .replaceAll(' ', '-')
}

export const getGetIngredientsFromStep = (
  step: string,
  recipeId: string,
): RecipeIngredient[] => {
  const splits = step.split('!')

  const ingredients: RecipeIngredient[] = []

  // Every odd number should be an ingredient when using modulo
  for (let i = 0; i < splits.length; i++) {
    if (i % 2 === 1) {
      // Step
      const ingredientSplit = splits[i].split(':')
      if (ingredientSplit.length !== 3) {
        throw new Error(`'${splits[i]}' is not a valid ingredient`)
      }
      ingredients.push({
        amount: Number(ingredientSplit[0]),
        unit: ingredientSplit[1] as Unit,
        ingredientId: ingredientSplit[2],
        recipeId,
      })
    }
  }

  return ingredients
}

export const avg = (list: number[]) => {
  return list.reduce((prev, cur) => prev + cur, 0) / list.length
}
