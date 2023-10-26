import { Box, Typography } from '@mui/material'
import { debounce } from '@mui/material/utils'
import { Ingredient, MealType, Recipe, RecipeType } from '@prisma/client'
import { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 } from 'uuid'
import YKTextField from '#components/General/YKTextField'
import Link from '#components/Link'
import CuisineAutocomplete from '#components/Recipe/CuisineAutocomplete'
import MealTypeSelect from '#components/Recipe/MealTypeSelect'
import PreparationTimePicker from '#components/Recipe/PreparationTimePicker'
import RecipeTypeSelect from '#components/Recipe/RecipeTypeSelect'

const defaultRecipe: Recipe & { ingredients: Ingredient[] } = {
  id: v4(),

  name: '',
  description: '',
  mealType: 'DINNER',
  persons: 4,
  preparationTime: new Date(0, 0, 0, 1, 0, 0, 0),
  recipeType: 'MAIN',

  steps: [],
  ingredients: [],
  cuisineName: '',
  image: '',

  // Will be overwritten by server anyways
  ownerId: '',
  updated: new Date(),
  created: new Date(),
}

const CreateRecipePage: FC = () => {
  // Translations
  const { t } = useTranslation('common')
  // Auth
  const { data: session, status } = useSession()
  const { pathname } = useRouter()

  // States
  const [recipe, setRecipe] = useState(defaultRecipe)

  if (status === 'unauthenticated') {
    return (
      <Box>
        <Typography>You need to be logged in to create a recipe.</Typography>
        <Link href={`/auth/signin?callbackUrl=${pathname}`}>Login</Link>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <NextSeo
        title="Create Recipe"
        description="This page allows the user to create a new recipe to add to their recipe collection. This recipe can also be public."
      />
      <Box
        sx={{
          width: {
            xs: '100%',
            sm: '400px',
          },
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="h3">{t('create_recipe')}</Typography>
        <YKTextField
          value={recipe.name}
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }}
          placeholder={t('name')}
        />
        <YKTextField
          value={recipe.description}
          multiline
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }}
          placeholder={t('description')}
        />
        <CuisineAutocomplete
          t={t}
          defaultCuisine={recipe.cuisineName}
          onChange={(cuisine) =>
            setRecipe((prev) => ({ ...prev, cuisineName: cuisine?.name ?? '' }))
          }
        />
        <MealTypeSelect
          t={t}
          value={recipe.mealType}
          onChange={(mealType) => setRecipe((prev) => ({ ...prev, mealType }))}
        />
        <YKTextField
          value={recipe.persons}
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              persons: Number.parseInt(e.target.value),
            }))
          }}
          type="number"
          placeholder={t('persons')}
        />
        <RecipeTypeSelect
          t={t}
          value={recipe.recipeType}
          onChange={(recipeType) => {
            setRecipe((prev) => ({
              ...prev,
              recipeType,
            }))
          }}
        />
        <PreparationTimePicker
          t={t}
          value={recipe.preparationTime}
          onChange={(preparationTime) => {
            setRecipe((prev) => ({
              ...prev,
              preparationTime,
            }))
          }}
        />
        N
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

export default CreateRecipePage
