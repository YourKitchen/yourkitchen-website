import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { Recipe } from '@prisma/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import useSWR from 'swr'
import Link from '#components/Link'
import { YKResponse } from '#models/ykResponse'
import { PublicRecipe } from '#pages/recipes'

/**
 * Visual representation of a recipe
 */
const RecipePage = () => {
  // Translations
  const { t } = useTranslation('common')

  const router = useRouter()

  const recipeId = useMemo(() => {
    return router.query.recipeId
  }, [router])

  const { data: recipe, isValidating: loading } = useSWR<
    YKResponse<PublicRecipe>
  >(`recipe/${recipeId}`)

  const image = useMemo(() => {
    if (recipe) {
      if (recipe.data.image?.length > 0) {
        return recipe.data.image[0]
      }
    }
    return undefined
  }, [recipe])

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '350px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }
  if (!recipe) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '350px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography>{t('recipe_not_found')}</Typography>{' '}
      </Box>
    )
  }

  return (
    <Box sx={{ margin: 4, display: 'flex' }}>
      <Box sx={{ flex: { sm: 1.0, md: 0.4, lg: 0.2 } }}>
        {/* Logo, ratings & ingredients */}
        <Link
          sx={{
            display: 'block',
            width: '75%',
            aspectRatio: 1,
            cursor: 'default',
            backgroundImage: image ? `url(${image.link})` : undefined,
          }}
          href={(image ? image.photoRefUrl : null) ?? ''}
          aria-label={image ? `Picture by ${image.photographer}` : undefined}
        />
        <Typography variant="h4">{recipe.data.name}</Typography>
      </Box>
      <Box sx={{ flex: { sm: 1.0, md: 0.6, lg: 0.8 } }}>
        {/* Steps */}
        <List>
          {recipe.data.steps.map((step, index) => (
            <ListItem key={`step-${index}`}>
              <ListItemText>{step}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export const getStaticPaths: GetStaticPaths<{ recipeId: string }> =
  async () => {
    return {
      paths: [], //indicates that no page needs be created at build time
      fallback: 'blocking', //indicates the type of fallback
    }
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

export default RecipePage
