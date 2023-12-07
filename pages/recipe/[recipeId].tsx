import Link from '#components/Link'
import RecipeRating from '#components/Recipe/RecipeRating'
import YKChip from '#components/Recipe/YKChip'
import { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { PublicRecipe } from '#pages/recipes'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { AllergenType, Ingredient, RecipeIngredient } from '@prisma/client'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { Session, getServerSession } from 'next-auth'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo, RecipeJsonLd } from 'next-seo'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FC, useMemo, useState } from 'react'

const SITE_URL = process.env.SITE_URL ?? 'https://yourkitchen.io'

interface RecipePageProps {
  recipe: PublicRecipe & {
    ingredients: (RecipeIngredient & { ingredient: Ingredient })[]
    rating: number
  }
  user?: Session['user']
}

/**
 * Visual representation of a recipe
 */
const RecipePage: FC<RecipePageProps> = ({ recipe, user }) => {
  // Translations
  const { t } = useTranslation('common')

  // Router
  const router = useRouter()

  // States
  const [completedStep, setCompletedStep] = useState(-1)
  const [allergenesOpen, setAllergenesOpen] = useState(false)

  // Memos
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
    return allergenes.filter((allergen) => userAllergenes.includes(allergen))
  }, [allergenes, user])

  console.log(router.pathname)

  return (
    <Box
      sx={{
        margin: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <NextSeo
        title={recipe.name}
        description={recipe.description ?? t('recipe_page_default_description')}
      />
      <RecipeJsonLd
        name={recipe.name}
        authorName={recipe.owner.name ?? 'YourKitchen'} // It is required, and will often be set.
        description={recipe.description ?? t('recipe_page_default_description')}
        category={recipe.recipeType}
        cuisine={recipe.cuisineName}
        datePublished={recipe.created as any as string} // It is a string
        yields={`${recipe.persons} Portions`}
        images={recipe.image.map((image) => image.link)}
        totalTime={`PT${recipe.preparationTime}M`}
        ingredients={recipe.ingredients.map(
          (ingredient) =>
            `${ingredient.amount} ${ingredient.unit} ${ingredient.ingredient.name}`,
        )}
        aggregateRating={{
          ratingValue: recipe.rating.toString(),
          ratingCount: recipe.ratings.length.toString(),
        }}
        instructions={recipe.steps.map((step, index) => ({
          text: step,
          url: `${SITE_URL}/recipe/${recipe.id}#step${index}`,
        }))}
      />
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
              cursor: 'default',
              backgroundImage: image ? `url(${image.link})` : undefined,
            }}
            href={(image ? image.photoRefUrl : null) ?? ''}
            aria-label={image ? `Picture by ${image.photographer}` : undefined}
          />
          <Typography variant="h4">{recipe.name}</Typography>

          <Link
            href={`/user/${recipe.ownerId}`}
            sx={{
              backgroundColor: (theme) => theme.palette.background.paper,
              borderRadius: 2,
              height: '50px',
              width: '170px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: 1,
              my: 2,
            }}
          >
            {recipe.owner.image && (
              <Image
                alt={`Profile picture for ${recipe.owner.name}`}
                src={recipe.owner.image}
                width={40}
                height={40}
              />
            )}
            <Typography>{recipe.owner.name}</Typography>
          </Link>
          <RecipeRating t={t} recipe={recipe} />

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
            <YKChip label={`${recipe.persons} ${t('persons')}`} />
            <YKChip
              label={`${recipe.ingredients.length} ${t('ingredients')}`}
            />
            <YKChip label={recipe.cuisineName} />
            <YKChip label={`${recipe.steps.length} ${t('steps')}`} />
            <YKChip label={`${t(recipe.mealType.toLowerCase())}`} />
            <YKChip
              onClick={() => {
                setAllergenesOpen((prev) => !prev)
              }}
              onDelete={() => setAllergenesOpen((prev) => !prev)}
              label={`${allergenes.length} ${t('allergenes')}`}
              deleteIcon={allergenesOpen ? <ExpandLess /> : <ExpandMore />}
            />
            <YKChip
              label={`${t(recipe.recipeType.toLowerCase())} ${t('dish')}`}
            />
          </Box>
          <Collapse
            in={allergenesOpen}
            sx={{
              mt: 1,
              color: (theme) =>
                errorAllergenes.length > 0
                  ? theme.palette.error[theme.palette.mode]
                  : theme.palette.text.primary,
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
              {recipe.ingredients?.map((ingredient) => (
                <ListItem key={ingredient.ingredientId}>{`${
                  ingredient.amount
                } ${t(ingredient.unit.toLowerCase())} ${
                  ingredient.ingredient.name
                }`}</ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ flex: { sm: 1.0, md: 0.6 } }}>
            {/* Steps */}
            <List>
              {recipe.steps.map((step, index) => (
                <ListItem
                  sx={{
                    cursor: 'pointer',
                    textDecoration:
                      completedStep >= index ? 'line-through' : undefined,
                    '&:hover': {
                      textDecoration: 'line-through',
                    },
                  }}
                  key={`step-${index}`}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const recipe = await api.get<YKResponse<['recipe']>>(
      `database/recipe/${context.params?.recipeId}`,
    )

    const session = await getServerSession(
      context.req,
      context.res,
      authOptions,
    )

    if (!recipe) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        user: session ? JSON.parse(JSON.stringify(session.user)) : null,
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
