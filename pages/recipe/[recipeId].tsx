import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import {
  AllergenType,
  Ingredient,
  Recipe,
  RecipeIngredient,
} from '@prisma/client'
import { DateTime } from 'luxon'
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import { Session, getServerSession } from 'next-auth'
import { getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React, { FC, useMemo } from 'react'
import Link from '#components/Link'
import YKChip from '#components/Recipe/YKChip'
import { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { PublicRecipe } from '#pages/recipes'

interface RecipePageProps {
  recipe: PublicRecipe & {
    ingredients: (RecipeIngredient & { ingredient: Ingredient })[]
  }
  user?: Session['user']
}

/**
 * Visual representation of a recipe
 */
const RecipePage: FC<RecipePageProps> = ({ recipe, user }) => {
  // Translations
  const { t } = useTranslation('common')

  const image = useMemo(() => {
    if (recipe) {
      if (recipe.image?.length > 0) {
        return recipe.image[0]
      }
    }
    return undefined
  }, [recipe])

  const preparationTime = useMemo(() => {
    if (recipe) {
      const dateTime = DateTime.fromMillis(recipe.preparationTime * 60 * 1000, {
        zone: 'utc',
      })

      return dateTime.toFormat('HH:mm')
    }
    return null
  }, [recipe])

  const allergenes = useMemo(() => {
    if (recipe) {
      return Array.from(
        new Set([
          ...recipe.ingredients.flatMap(
            (ingredient) => ingredient.ingredient.allergenTypes,
          ),
        ]),
      )
    }
    return []
  }, [recipe])

  const errorAllergenes = useMemo(() => {
    const userAllergenes = (user?.allergenes ?? []) as AllergenType[]
    // If some of the allergenes are in the users allergenes, they are allergic to the dish. Show the error/warning.
    return allergenes.some((allergen) => userAllergenes.includes(allergen))
  }, [allergenes, user])

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
        <NextSeo title="Recipe not found" />
        <Typography>{t('recipe_not_found')}</Typography>{' '}
      </Box>
    )
  }

  return (
    <Box sx={{ margin: 4, display: 'flex' }}>
      <NextSeo />
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
        <Typography variant="h4">{recipe.name}</Typography>
        <Accordion
          sx={{
            color: (theme) =>
              errorAllergenes
                ? theme.palette.error[theme.palette.mode]
                : theme.palette.success[theme.palette.mode],
          }}
        >
          <AccordionSummary>
            {errorAllergenes ? (
              <ErrorIcon
                sx={{
                  color: (theme) =>
                    errorAllergenes
                      ? theme.palette.error[theme.palette.mode]
                      : theme.palette.success[theme.palette.mode],
                  mr: 1,
                }}
              />
            ) : (
              <CheckCircle
                sx={{
                  color: (theme) =>
                    errorAllergenes
                      ? theme.palette.error[theme.palette.mode]
                      : theme.palette.success[theme.palette.mode],
                  mr: 1,
                }}
              />
            )}
            {`${allergenes.length} ${t('allergenes')}`}
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {allergenes.map((allergen) => (
                <ListItem key={allergen}>
                  <ListItemText>{allergen}</ListItemText>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginY: 1 }}>
          <YKChip label={`${t('preparation_time')} ${preparationTime}`} />
          <YKChip label={`${recipe.persons} ${t('persons')}`} />
          <YKChip label={`${recipe.ingredients.length} ${t('ingredients')}`} />
          <YKChip label={recipe.cuisineName} />
          <YKChip label={`${recipe.steps.length} ${t('steps')}`} />
          <YKChip label={`${t(recipe.mealType.toLowerCase())}`} />
          <YKChip label={`${allergenes.length} ${t('allergenes')}`} />
          <YKChip
            label={`${t(recipe.recipeType.toLowerCase())} ${t('dish')}`}
          />
        </Box>
        <Box>
          <Typography>{t('ingredients')}</Typography>
          <List>
            {recipe.ingredients?.map((ingredient) => (
              <ListItem key={ingredient.ingredientId}>{`${
                ingredient.amount
              } ${t(ingredient.unit.toLowerCase())} ${
                ingredient.ingredient.name
              }`}</ListItem>
            ))}
          </List>
        </Box>
        {recipe.description && (
          <Typography sx={{ mt: 1 }}>{recipe.description}</Typography>
        )}
        <Typography sx={{ mt: 1 }}>
          {`Created ${DateTime.fromISO(recipe.created as any).toFormat(
            'dd-MM-yyyy hh:mm',
          )}`}
        </Typography>
        <Typography variant="caption">
          {`Last Updated ${DateTime.fromISO(recipe.updated as any).toFormat(
            'dd-MM-yyyy hh:mm',
          )}`}
        </Typography>
      </Box>
      <Box sx={{ flex: { sm: 1.0, md: 0.6, lg: 0.8 } }}>
        {/* Steps */}
        <List>
          {recipe.steps.map((step, index) => (
            <ListItem key={`step-${index}`}>
              <ListItemText>{step}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const recipe = await api.get<YKResponse<['recipe']>>(
      `database/recipe/${context.params?.recipeId}`,
    )

    const session = await getSession(context)

    if (!recipe) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        user: session?.user,
        recipe: recipe.data.data,
        ...(context.locale
          ? {
              ...(await serverSideTranslations(context.locale, [
                'common',
                'header',
                'footer',
              ])),
            }
          : {}),
      },
    }
  } catch (err) {
    return {
      notFound: true,
    }
  }
}

export default RecipePage
