'use client'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import {
  Box,
  Collapse,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { DateTime } from 'luxon'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import type {
  AllergenType,
  Ingredient,
  RecipeIngredient,
  Unit,
} from 'prisma/generated/prisma/client'
import { type FC, useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'
import RecipeRating from '#components/Recipe/RecipeRating'
import YKChip from '#components/Recipe/YKChip'
import type { PublicRecipe } from '#models/publicRecipe'
import type { YKResponse } from '#models/ykResponse'

const _SITE_URL = process.env.SITE_URL ?? 'https://yourkitchen.io'

interface RecipePageProps {
  recipe: PublicRecipe & {
    ingredients: (RecipeIngredient & { ingredient: Ingredient })[]
    rating: number
  }
  user?: Session['user']
}

interface IngredientItemProps {
  t: (key: string) => string
  recipeIngredient: RecipeIngredient & { ingredient: Ingredient }
  progress: number | undefined
  hovered: boolean
}

const IngredientItem: FC<IngredientItemProps> = ({
  t,
  recipeIngredient,
  progress,
  hovered,
}) => {
  const amountString = useMemo((): string => {
    if (progress) {
      return `${progress}/${recipeIngredient.amount}`
    }
    return recipeIngredient.amount.toString()
  }, [recipeIngredient.amount, progress])

  return (
    <ListItem
      sx={{
        textDecoration:
          progress === recipeIngredient.amount ? 'line-through' : undefined,
        fontWeight: hovered ? 'bold' : undefined,
      }}
      key={recipeIngredient.ingredientId}
    >{`${amountString} ${t(recipeIngredient.unit.toLowerCase())} ${
      recipeIngredient.ingredient.name
    }`}</ListItem>
  )
}

/**
 * Visual representation of a recipe
 */
const RecipePage: FC = () => {
  const params = useParams<{ recipeId: string }>()

  // Translations
  const t = useTranslations('common')
  const { data: recipe } = useSWR<YKResponse<RecipePageProps['recipe']>>(
    `recipe/${params.recipeId}`,
  )

  const { data: session } = useSession()
  const user = session?.user

  const [completedStep, setCompletedStep] = useState(-1)
  const [allergenesOpen, setAllergenesOpen] = useState(false)
  const [hoveredStep, setHoveredStep] = useState(-1)

  // Memos
  const image = useMemo(() => {
    if (recipe) {
      if (recipe.data.image?.length > 0) {
        return recipe.data.image[0]
      }
    }
    return undefined
  }, [recipe])

  const preparationTime = useMemo(() => {
    if (recipe) {
      const dateTime = DateTime.fromMillis(
        recipe.data.preparationTime * 60 * 1000,
        {
          zone: 'utc',
        },
      )

      return dateTime.toFormat('HH:mm')
    }
    return null
  }, [recipe])

  const allergenes = useMemo(() => {
    if (recipe) {
      return Array.from(
        new Set([
          ...recipe.data.ingredients.flatMap(
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
    return allergenes.filter((allergen) => userAllergenes.includes(allergen))
  }, [allergenes, user])

  const getIngredientsFromStep = useCallback(
    (step: string | undefined): Omit<RecipeIngredient, 'recipeId'>[] => {
      const ingredients: Omit<RecipeIngredient, 'recipeId'>[] = []

      if (!step) {
        return ingredients
      }

      const stepSplit = step.split('!')

      if (stepSplit.length < 2) {
        // No ingredients, because there is no split
        return ingredients
      }

      // We start at 1, because every odd number is an ingredient if formatted correctly. (Has been validated before uplaoded)
      for (let i = 1; i < stepSplit.length; i += 2) {
        const item = stepSplit[i]

        const colonSplit = item.split(':')

        if (colonSplit.length !== 3) {
          console.error(`Invalid split: ${item}`)
          continue
        }

        const [amount, unit, id] = colonSplit

        ingredients.push({
          amount: Number.parseFloat(amount),
          unit: unit as Unit,
          ingredientId: id,
        })
      }

      return ingredients
    },
    [],
  )

  const ingredientsProgress = useMemo(() => {
    // Get what amount of the ingredients have been used.
    // This allows for easier readability of what's back.
    const progressMap: { [ingredientId: string]: number } = {}

    for (let i = 0; i <= completedStep; i++) {
      const step = recipe?.data.steps[i]

      const ingredients = getIngredientsFromStep(step)

      for (const ingredient of ingredients) {
        if (!progressMap[ingredient.ingredientId]) {
          progressMap[ingredient.ingredientId] = 0
        }
        progressMap[ingredient.ingredientId] += ingredient.amount
      }
    }

    return progressMap
  }, [completedStep, getIngredientsFromStep, recipe?.data.steps])

  if (!recipe?.data) {
    return null
  }

  return (
    <Box
      sx={{
        margin: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: '85%', md: '70%', lg: '60%' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo, ratings & ingredients */}
          <Link
            sx={{
              display: 'block',
              width: '250px',
              height: '250px',
              aspectRatio: 1,
              mb: 2,
              cursor: 'default',
              borderRadius: 6,
              backgroundImage: image ? `url(${image.link})` : undefined,
            }}
            href={(image ? image.photoRefUrl : null) ?? ''}
            aria-label={image ? `Picture by ${image.photographer}` : undefined}
          />
          <Typography variant="h4">{recipe.data.name}</Typography>

          <Link
            href={`/user/${recipe.data.ownerId}`}
            sx={{
              backgroundColor: 'var(--mui-palette-background-paper)',
              height: '50px',
              width: '170px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              borderRadius: 8,
              p: 1,
              my: 2,
            }}
          >
            {recipe.data.owner.image && (
              <Image
                alt={`Profile picture for ${recipe.data.owner.name}`}
                src={recipe.data.owner.image}
                width={40}
                height={40}
                style={{
                  borderRadius: '50%',
                }}
              />
            )}
            <Typography>{recipe.data.owner.name}</Typography>
          </Link>
          <RecipeRating t={t} recipe={recipe.data} />

          {recipe.data.description && (
            <Typography sx={{ mt: 1 }}>{recipe.data.description}</Typography>
          )}
          <Typography sx={{ mt: 1 }}>
            {`Created ${DateTime.fromISO(recipe.data.created as any).toFormat(
              'dd-MM-yyyy hh:mm',
            )}`}
          </Typography>
          <Typography variant="caption">
            {`Last Updated ${DateTime.fromISO(
              recipe.data.updated as any,
            ).toFormat('dd-MM-yyyy hh:mm')}`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1,
              marginY: 1,
            }}
          >
            <YKChip label={`${t('preparation_time')} ${preparationTime}`} />
            <YKChip label={`${recipe.data.persons} ${t('persons')}`} />
            <YKChip
              label={`${recipe.data.ingredients.length} ${t('ingredients')}`}
            />
            <YKChip label={recipe.data.cuisineName} />
            <YKChip label={`${recipe.data.steps.length} ${t('steps')}`} />
            <YKChip label={`${t(recipe.data.mealType.toLowerCase())}`} />
            <YKChip
              onClick={() => {
                setAllergenesOpen((prev) => !prev)
              }}
              onDelete={() => setAllergenesOpen((prev) => !prev)}
              label={`${allergenes.length} ${t('allergenes')}`}
              deleteIcon={allergenesOpen ? <ExpandLess /> : <ExpandMore />}
            />
            <YKChip
              label={`${t(recipe.data.recipeType.toLowerCase())} ${t('dish')}`}
            />
          </Box>
          <Collapse
            in={allergenesOpen}
            sx={{
              mt: 1,
              color: (theme) =>
                errorAllergenes.length > 0
                  ? theme.palette.error[theme.palette.mode]
                  : 'var(--mui-palette-text-primary)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 1,
                marginY: 1,
              }}
            >
              {allergenes.map((allergen) => (
                <YKChip
                  color={
                    user?.allergenes.includes(allergen) ? 'error' : undefined
                  }
                  label={allergen}
                  key={allergen}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
        <Box sx={{ display: 'flex', my: 2 }}>
          <Box sx={{ flex: { sm: 1.0, md: 0.4 } }}>
            <Typography
              sx={{
                mx: 2,
                mt: 2,
                mb: 1,
                fontWeight: 'bold',
              }}
            >
              {t('ingredients')}
            </Typography>
            <List>
              {recipe.data.ingredients?.map((ingredient) => {
                const currentlyHoveredStep = recipe.data.steps[hoveredStep]
                const hoveredIngredient =
                  getIngredientsFromStep(currentlyHoveredStep)
                const isHovered = hoveredIngredient.some(
                  (hIngredient) =>
                    hIngredient.ingredientId === ingredient.ingredient.id,
                )

                return (
                  <IngredientItem
                    key={ingredient.ingredientId}
                    t={t}
                    hovered={isHovered}
                    recipeIngredient={ingredient}
                    progress={ingredientsProgress[ingredient.ingredient.id]}
                  />
                )
              })}
            </List>
          </Box>
          <Box sx={{ flex: { sm: 1.0, md: 0.6 } }}>
            {/* Steps */}
            <List>
              {recipe.data.steps.map((step, index) => (
                <ListItem
                  sx={{
                    cursor: 'pointer',
                    textDecoration:
                      completedStep >= index ? 'line-through' : undefined,
                  }}
                  key={`step-${index}`}
                  onMouseOver={() => setHoveredStep(index)}
                  onMouseLeave={() =>
                    setHoveredStep((prev) => (prev === index ? -1 : prev))
                  }
                  onClick={() => {
                    setCompletedStep((prev) => (prev === index ? -1 : index))
                  }}
                >
                  <ListItemText>{step}</ListItemText>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default RecipePage
