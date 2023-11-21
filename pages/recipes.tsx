import {
  Box,
  MenuItem,
  RatingPropsSizeOverrides,
  Select,
  Typography,
} from '@mui/material'
import { Cuisine, MealType, Rating, Recipe, RecipeImage } from '@prisma/client'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import ExploreRow from '#components/Explore/ExploreRow'
import { YKResponse } from '#models/ykResponse'

export type PublicRecipe = Recipe & {
  image: RecipeImage[]
  ratings: Pick<Rating, 'score'>[]
}

/**
 * Recipes overview featuring filters
 */
const RecipesPage = () => {
  const { t } = useTranslation('common')

  const [mealType, setMealType] = useState<MealType>(MealType.DINNER)
  const [cuisineName, setCuisineName] = useState<string>('')

  // Cuisines
  const { data: cuisines } = useSWR<YKResponse<Cuisine[]>>('cuisine')

  // Recipes
  const { data: popularRecipes, isValidating: popularLoading } =
    useSWR<YKResponse<PublicRecipe[]>>('recipe/popular')
  const { data: mealTypeRecipes, isValidating: mealTypeLoading } = useSWR<
    YKResponse<PublicRecipe[]>
  >(`recipe?mealType=${mealType}`)
  const { data: cuisineRecipes, isValidating: cuisineLoading } = useSWR<
    YKResponse<PublicRecipe[]>
  >(cuisineName !== '' ? `recipe?cuisineName=${cuisineName}` : null)

  useEffect(() => {
    if (cuisines && cuisines.data.length > 0) {
      setCuisineName(cuisines.data[0].name)
    }
  }, [cuisines])

  return (
    <Box
      sx={{
        margin: 4,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: { sm: '100%', md: '80%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h2">{t('recipes')}</Typography>
        <Typography variant="h4">{t('popular_recipes')}</Typography>
        <ExploreRow
          loading={popularLoading}
          recipes={popularRecipes?.data ?? []}
        />
        <Typography variant="h4">
          {t('meal_type')}{' '}
          <Select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
          >
            {[MealType.DINNER, MealType.LUNCH, MealType.BREAKFAST].map(
              (type) => (
                <MenuItem key={type} value={type}>
                  {t(type.toLowerCase())}
                </MenuItem>
              ),
            )}
          </Select>
        </Typography>
        <ExploreRow
          loading={mealTypeLoading}
          recipes={mealTypeRecipes?.data ?? []}
        />
        <Typography variant="h4">
          {t('cuisine')}{' '}
          <Select
            value={cuisineName}
            onChange={(e) => setCuisineName(e.target.value)}
          >
            {cuisines?.data.map((cuisine) => (
              <MenuItem key={cuisine.name} value={cuisine.name}>
                {cuisine.name}
              </MenuItem>
            ))}
          </Select>
        </Typography>
        <ExploreRow
          loading={cuisineLoading}
          recipes={cuisineRecipes?.data ?? []}
        />
      </Box>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: locale
      ? {
          ...(await serverSideTranslations(locale, [
            'common',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {},
  }
}

export default RecipesPage
