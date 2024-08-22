import { Edit } from '@mui/icons-material'
import { Box, Button, Link, Rating, Typography } from '@mui/material'
import { Rating as PrismaRating, Recipe, RecipeImage } from '@prisma/client'
import type { TFunction } from 'i18next'
import Image from 'next/image'
import type { FC } from 'react'
import useSWR from 'swr'
import type { Meal } from '#models/meal'
import { YKResponse } from '#models/ykResponse'
import { avg } from '#utils/index'

interface MealCellProps {
  t: TFunction
  meal: Meal
  editMealRecipe: (recipeId: string | null) => Promise<void> | void
}

export const MealCell: FC<MealCellProps> = ({ t, meal, editMealRecipe }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: 'transparent',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {meal.length === 0 ? (
        <Button
          sx={{
            width: '100%',
            '&:hover': {
              backgroundColor: 'var(--mui-palette-background-paper)',
            },
          }}
          onClick={() => {
            editMealRecipe(null)
          }}
        >
          {t('add_recipe')}
        </Button>
      ) : null}
      {meal.map((mealRecipe) => (
        <Box
          key={mealRecipe.id}
          sx={{
            display: 'flex',
            gap: '4px',
          }}
        >
          <Link
            href={`/recipe/${mealRecipe.recipeId}`}
            key={mealRecipe.id}
            sx={{
              flex: 1,
              borderRadius: 2,
              display: 'flex',
              minHeight: '80px',
              alignItems: 'center',
              padding: 2,
              textDecoration: 'none',
              width: '100%',
              '&:hover': {
                backgroundColor: 'var(--mui-palette-background-paper)',
              },
            }}
          >
            <Image
              alt={`Recipe image for ${mealRecipe.recipe.name}`}
              width={50}
              height={50}
              style={{
                borderRadius: '20px',
              }}
              src={mealRecipe.recipe.image[0]?.link}
            />
            <Box
              sx={{
                ml: 2,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'column',
                  color: 'var(--mui-palette-text-primary)',
                }}
              >
                <Typography>{mealRecipe.recipe.name}</Typography>
                <Rating
                  sx={{
                    width: '100%',
                  }}
                  disabled
                  value={avg(
                    mealRecipe.recipe.ratings.map((rating) => rating.score),
                  )}
                />
              </Box>
            </Box>
          </Link>
          <Button onClick={() => editMealRecipe(mealRecipe.id)}>
            <Edit />
          </Button>
        </Box>
      ))}
    </Box>
  )
}

export default MealCell
