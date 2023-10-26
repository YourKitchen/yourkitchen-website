import { Autocomplete, Box, Button, TextField, Typography } from '@mui/material'
import { debounce } from '@mui/material/utils'
import { Ingredient, Recipe } from '@prisma/client'
import { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 } from 'uuid'
import Link from '#components/Link'
import CuisineAutocomplete from '#components/Recipe/CuisineAutocomplete'

const defaultRecipe: Recipe & { ingredients: Ingredient[] } = {
  id: v4(),

  name: '',
  description: '',
  mealType: 'DINNER',
  persons: 4,
  preparationTime: new Date(0, 0, 0, 1, 0, 0, 0),
  recipeType: 'TEST',

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
        <TextField
          value={recipe.name}
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }}
          fullWidth
          placeholder={t('name')}
        />
        <TextField
          value={recipe.description}
          multiline
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }}
          fullWidth
          placeholder={t('description')}
        />
        <CuisineAutocomplete
          t={t}
          defaultCuisine={recipe.cuisineName}
          onChange={(cuisine) =>
            setRecipe((prev) => ({ ...prev, cuisineName: cuisine.name }))
          }
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

export default CreateRecipePage
