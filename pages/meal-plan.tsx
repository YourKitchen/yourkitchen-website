import Link from '#components/Link'
import { WeekPicker } from '#components/MealPlan/WeekPicker'
import { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { sameDate } from '#utils/meaplanHelper'
import { Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  TextField,
  Typography,
  debounce,
} from '@mui/material'
import {
  MealPlan,
  MealPlanRecipe,
  MealType,
  Rating as PrismaRating,
  Recipe,
  RecipeImage,
  User,
} from '@prisma/client'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { TFunction, useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

type Meal = (MealPlanRecipe & {
  recipe: Recipe & {
    image: RecipeImage[]
    ratings: PrismaRating[]
  }
})[]

interface MealCellProps {
  t: TFunction
  meal: Meal
  editMealRecipe: (recipeId: string | null) => Promise<void> | void
}

const avg = (list: number[]) => {
  return list.reduce((prev, cur) => prev + cur, 0) / list.length
}

const MealCell: FC<MealCellProps> = ({ t, meal, editMealRecipe }) => {
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
      {meal.length === 0 && (
        <Button
          sx={{
            width: '100%',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.background.paper,
            },
          }}
          onClick={() => {
            editMealRecipe(null)
          }}
        >
          {t('add_recipe')}
        </Button>
      )}
      {meal.map((mealRecipe) => (
        <Box
          sx={{
            display: 'flex',
            gap: '4px',
          }}
        >
          <Link
            href={`/recipe/${mealRecipe.id}`}
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
                backgroundColor: (theme) => theme.palette.background.paper,
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
                  color: (theme) => theme.palette.text.primary,
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

const MealPlanPage: FC = () => {
  // Translations
  const { t } = useTranslation('common')

  useSession({
    required: true,
  })

  // States
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string>('own')
  const [selectedWeekDate, setSelectedWeekDate] = useState(DateTime.utc())
  const [editMealPosition, setEditMealPosition] = useState<{
    date: DateTime
    meal: MealType
  }>()

  // Search
  const [value, setValue] = useState('') // Debounced
  const [searchValue, setSearchValue] = useState('') // Reactive

  const setValueDelayed = useMemo(() => debounce(setValue, 250), [])

  // Data
  const { data: allMealPlans } =
    useSWR<(MealPlan & { owner: User })[]>('mealplan')
  const { data: selectedMealPlan, mutate: updateMealPlan } = useSWR<
    MealPlan & {
      // Not really meal, just matches the type.
      // It merely contains a list of all the MealPlanRecipes in the meal plan.
      recipes: Meal
    }
  >({
    url: `mealplan/${selectedMealPlanId}`,
    weekDate: selectedWeekDate.toISO(),
  })

  const { data: searchRecipes, isValidating: searchRecipesLoading } = useSWR<
    YKResponse<(Recipe & { image: RecipeImage[]; ratings: PrismaRating[] })[]>
  >(
    value.length >= 2
      ? { url: 'recipe/search', searchTerm: value, limit: 4 }
      : null,
  )

  useEffect(() => {
    if (allMealPlans && allMealPlans.length > 0) {
      setSelectedMealPlanId(allMealPlans[0].id)
    }
  }, [allMealPlans])

  const getMeal = useCallback(
    (date: DateTime, meal: MealType): Meal => {
      if (!selectedMealPlan) {
        return []
      }
      return selectedMealPlan.recipes
        .filter(
          (recipe) =>
            sameDate(date, DateTime.fromISO(recipe.date as any as string)) &&
            recipe.mealType === meal,
        )
        .sort((recipe) => (recipe.recipeType === 'MAIN' ? -1 : 1))
    },
    [selectedMealPlan],
  )

  const datesOfWeek = useMemo(() => {
    let currentDateTime = selectedWeekDate.startOf('week')

    const dates: DateTime[] = []
    for (let i = 0; i < 7; i++) {
      dates.push(currentDateTime)

      currentDateTime = currentDateTime.plus({
        day: 1,
      })
    }

    return dates
  }, [selectedWeekDate])

  const updateMeal = (newRecipe: Recipe) => {
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
  }

  return (
    <Box>
      <NextSeo
        title={t('meal_plan')}
        description="This page allows the user to navigate through their own as well as their followed meal plans."
        noindex
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mx: 6,
        }}
      >
        <Dialog
          maxWidth="md"
          fullWidth
          open={editMealPosition !== undefined}
          onClose={() => setEditMealPosition(undefined)}
        >
          <DialogTitle>{t('change_meal')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('change_meal_description')}
            </DialogContentText>
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
              {!searchRecipes && searchRecipesLoading ? (
                <CircularProgress />
              ) : null}
              {searchRecipes?.data.map((recipe) => (
                <Button
                  key={recipe.id}
                  sx={{
                    padding: '12px',
                    display: 'flex',
                    borderRadius: '8px',
                    width: '100%',
                    justifyContent: 'start',
                    backgroundColor: (theme) =>
                      theme.palette.background.default,
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
                        backgroundColor: (theme) => theme.palette.primary.main,
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography>{recipe.name}</Typography>
                    <Rating
                      disabled={true}
                      value={avg(recipe.ratings.map((rating) => rating.score))}
                    />
                  </Box>
                </Button>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMealPosition(undefined)}>
              {t('close')}
            </Button>
          </DialogActions>
        </Dialog>
        <WeekPicker
          value={selectedWeekDate}
          onChange={(dateTime) =>
            setSelectedWeekDate(dateTime ?? DateTime.utc())
          }
          buttonProps={{
            variant: 'contained',
          }}
          t={t}
        />
        {/* Meal plan selection */}
        <FormControl
          key="select-meal-plan-control"
          sx={{
            width: '300px',
          }}
        >
          <InputLabel id="select-meal-plan">{`${t('select')} ${t(
            'meal_plan',
          )}`}</InputLabel>
          <Select
            value={selectedMealPlanId}
            onChange={(e) => setSelectedMealPlanId(e.target.value)}
            labelId="select-meal-plan"
            label={`${t('select')} ${t('meal_plan')}`}
          >
            <MenuItem key={'own'} value={'own'}>
              {t('my_meal_plan')}
            </MenuItem>
            {allMealPlans?.map((mealPlan) => (
              <MenuItem key={mealPlan.id} value={mealPlan.id}>
                {mealPlan.owner.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '150px repeat(3, 1fr);',
          m: 4,
          gap: '6px',
          rowGap: '16px',
        }}
      >
        {/* Representation of meal plan (Calendar view for the week) */}
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          {t('meal')}
        </Box>
        {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map(
          (mealType) => (
            <Box>
              <Typography
                sx={{
                  textAlign: 'center',
                  fontSize: '25px',
                  fontWeight: 'bold',
                }}
              >
                {t(mealType.toLowerCase())}
              </Typography>
            </Box>
          ),
        )}
        {daysOfWeek.map((_, index) => {
          const date = datesOfWeek[index]

          return (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography>{date.toFormat('EEEE')}</Typography>
                <Typography variant="subtitle1">
                  {date.toFormat('dd MMM')}
                </Typography>
              </Box>
              {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map(
                (mealType) => (
                  <MealCell
                    key={`${date.toFormat('dd-MM-yyyy')}_${mealType}`}
                    t={t}
                    meal={getMeal(date, mealType)}
                    editMealRecipe={() => {
                      setEditMealPosition({
                        date,
                        meal: mealType,
                      })
                    }}
                  />
                ),
              )}
            </>
          )
        })}
      </Box>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale
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

export default MealPlanPage
