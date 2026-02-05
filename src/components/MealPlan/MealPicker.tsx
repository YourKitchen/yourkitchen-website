'use client'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  debounce,
  Rating,
  TextField,
  Typography,
} from '@mui/material'
import type { DateTime } from 'luxon'
import Image from 'next/image'
import type { MealPlan, MealType, Recipe } from 'prisma/generated/prisma/client'
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { toast } from 'sonner'
import useSWR, { type KeyedMutator } from 'swr'
import type { Meal } from '#models/meal'
import type { PublicRecipe } from '#models/publicRecipe'
import type { TFunction } from '#models/TFunction'
import type { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { avg } from '#utils/index'

interface MealPickerProps {
  editMealPosition:
    | {
        date: DateTime
        meal: MealType
      }
    | undefined
  setEditMealPosition: Dispatch<
    SetStateAction<
      | {
          date: DateTime
          meal: MealType
        }
      | undefined
    >
  >
  updateMealPlan: KeyedMutator<
    MealPlan & {
      // Not really meal, just matches the type.
      // It merely contains a list of all the MealPlanRecipes in the meal plan.
      recipes: Meal
    }
  >
  t: TFunction
}

const RecipeRow: FC<{
  recipe: PublicRecipe
  updateMeal: (recipe: PublicRecipe) => void
}> = ({ recipe, updateMeal }) => {
  return (
    <Button
      key={recipe.id}
      sx={{
        padding: '12px',
        display: 'flex',
        borderRadius: '8px',
        width: '100%',
        justifyContent: 'start',
        backgroundColor: 'var(--mui-palette-background-default)',
      }}
      onClick={() => {
        updateMeal(recipe)
      }}
    >
      {recipe.image.length > 0 && recipe.image[0].link ? (
        <Image
          width={50}
          height={50}
          style={{
            borderRadius: '8px',
            marginRight: '12px',
          }}
          alt={`Image of ${recipe.name}`}
          src={recipe.image[0].link}
        />
      ) : (
        <Box
          sx={{
            display: 'block',
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            marginRight: '12px',
            backgroundColor: 'var(--mui-palette-primary-main)',
          }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography color={'var(--mui-palette-text-primary)'}>
          {recipe.name}
        </Typography>
        <Rating
          readOnly
          value={avg(recipe.ratings.map((rating) => rating.score))}
        />
      </Box>
    </Button>
  )
}

const MealPicker: FC<MealPickerProps> = ({
  updateMealPlan,
  editMealPosition,
  setEditMealPosition,
  t,
}) => {
  // Search
  const [value, setValue] = useState('') // Debounced
  const [searchValue, setSearchValue] = useState('') // Reactive

  const setValueDelayed = useMemo(() => debounce(setValue, 250), [])

  // Data
  const { data: searchRecipes, isValidating: searchRecipesLoading } = useSWR<
    YKResponse<PublicRecipe[]>
  >(
    value.length >= 2
      ? { url: 'recipe/search', searchTerm: value, limit: 4 }
      : null,
  )
  const { data: popularRecipes, isLoading: popularLoading } =
    useSWR<YKResponse<PublicRecipe[]>>('recipe/popular')

  const updateMeal = useCallback(
    (newRecipe: Recipe) => {
      // Check that we have an update position
      if (!editMealPosition) {
        toast.error('No meal position defined')
        return
      }

      // Update the meal plan
      toast.promise(
        api.put<YKResponse<MealPlan & { recipes: Meal }>>(
          'database/mealplan/own',
          {
            recipe: {
              date: editMealPosition.date.toJSDate(),
              mealType: editMealPosition.meal,
              recipeId: newRecipe.id,
              recipeType: newRecipe.recipeType,
            },
          },
        ),
        {
          loading: `${t('updating')} ${t('meal_plan')}`,
          error: (err) => err.message ?? err,
          success: (response) => {
            const data = response.data.data
            // Update local meal plan.

            updateMealPlan(data)

            return `${t('succesfully')} ${t('updated')} ${t('meal_plan')}`
          },
        },
      )

      setEditMealPosition(undefined)
    },
    [editMealPosition, t, setEditMealPosition, updateMealPlan],
  )

  const RecipeRows = useMemo(() => {
    if (searchRecipesLoading || popularLoading) {
      return <CircularProgress />
    }

    // If value length is less than 2, show the popular recipes instead
    if (value.length < 2) {
      return popularRecipes?.data.map((recipe) => (
        <RecipeRow key={recipe.id} recipe={recipe} updateMeal={updateMeal} />
      ))
    }

    return searchRecipes?.data.map((recipe) => (
      <RecipeRow key={recipe.id} recipe={recipe} updateMeal={updateMeal} />
    ))
  }, [
    value,
    updateMeal,
    searchRecipes,
    popularRecipes,
    popularLoading,
    searchRecipesLoading,
  ])

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={editMealPosition !== undefined}
      onClose={() => setEditMealPosition(undefined)}
    >
      <DialogTitle>{t('change_meal')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('change_meal_description')}</DialogContentText>
        {/* Search for new recipe */}
        <TextField
          placeholder={t('search_for_recipe')}
          fullWidth
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            setValueDelayed(e.target.value)
          }}
        />
        <Box
          sx={{
            marginY: '8px',
            minHeight: '250px',
            gap: '8px',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {RecipeRows}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditMealPosition(undefined)}>
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MealPicker
