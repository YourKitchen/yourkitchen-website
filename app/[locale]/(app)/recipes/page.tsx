'use client'
import ExploreRow from '#components/Explore/ExploreRow'
import SearchResults from '#components/Explore/Search/SearchResults'
import type { PublicRecipe } from '#models/publicRecipe'
import type { YKResponse } from '#models/ykResponse'
import {
  Box,
  MenuItem,
  Select,
  TextField,
  Typography,
  debounce,
} from '@mui/material'
import { type Cuisine, MealType } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { type FC, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

interface RecipesPageProps {
  params: {
    search_query?: string
  }
}

/**
 * Recipes overview featuring filters
 */
const RecipesPage: FC<RecipesPageProps> = ({ params }) => {
  const t = useTranslations('common')

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

  // Search
  const [value, setValue] = useState(params.search_query ?? '') // Debounced
  const [searchValue, setSearchValue] = useState(params.search_query ?? '') // Reactive

  const setValueDelayed = useMemo(() => debounce(setValue, 250), [])

  return (
    <Box
      sx={{
        margin: 4,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* TODO: Look into why this causes error concerning useContext */}
      {/* <SiteLinksSearchBoxJsonLd
        url={process.env.NEXTAUTH_URL ?? ''}
        potentialActions={[
          {
            target: `${process.env.NEXTAUTH_URL ?? ''}recipes?search_query`,
            queryInput: 'search_term_string',
          },
        ]}
      /> */}
      <Box
        sx={{
          width: { sm: '100%', md: '80%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h2">{t('recipes')}</Typography>
          <TextField
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
              setValueDelayed(e.target.value)
            }}
            placeholder={t('search')}
            sx={{
              transition: 'ease-in-out',
              transitionDuration: '0.12s',
              flex: 0.15,
              '&:focus,&:focus-within,&:active': {
                flex: 0.3,
              },
            }}
          />
        </Box>
        {searchValue.length > 0 ? (
          <SearchResults cuisines={cuisines?.data ?? []} value={value} />
        ) : (
          <>
            <Typography variant="h4">{t('popular_recipes')}</Typography>
            <ExploreRow recipes={popularRecipes?.data ?? []} />
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
            <ExploreRow recipes={mealTypeRecipes?.data ?? []} />
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
            <ExploreRow recipes={cuisineRecipes?.data ?? []} />
          </>
        )}
      </Box>
    </Box>
  )
}

export default RecipesPage
