import Link from '#components/Link'
import { WeekPicker } from '#components/MealPlan/WeekPicker'
import { sameDate } from '#utils/meaplanHelper'
import { Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Typography,
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
import { useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
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
  editMealRecipe: (recipeId?: string) => Promise<void> | void
}

const avg = (list: number[]) => {
  return list.reduce((prev, cur) => prev + cur, 0) / list.length
}

const MealCell: FC<MealCellProps> = ({ t, meal, editMealRecipe }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.background.paper,
        },
      }}
    >
      {meal.length === 0 && <Button>{t('add_recipe')}</Button>}
      {meal.map((mealRecipe) => (
        <Link
          href={`/recipe/${mealRecipe.id}`}
          key={mealRecipe.id}
          sx={{
            display: 'flex',
            minHeight: '80px',
            alignItems: 'center',
            padding: 2,
            textDecoration: 'none',
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
                alignItems: 'center',
                color: (theme) => theme.palette.text.primary,
              }}
            >
              <Typography>{mealRecipe.recipe.name}</Typography>
              <Button onClick={() => editMealRecipe(mealRecipe.id)}>
                <Edit />
              </Button>
            </Box>
            <Rating
              disabled
              value={avg(
                mealRecipe.recipe.ratings.map((rating) => rating.score),
              )}
            />
          </Box>
        </Link>
      ))}
    </Box>
  )
}

const MealPlanPage: FC = () => {
  // Translations
  const { t } = useTranslation('common')

  const { status } = useSession()
  const router = useRouter()

  // States
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string>('own')
  const [selectedWeekDate, setSelectedWeekDate] = useState(DateTime.utc())

  // Data
  const { data: allMealPlans } =
    useSWR<(MealPlan & { owner: User })[]>('mealplan')
  const { data: selectedMealPlan } = useSWR<
    MealPlan & {
      // Not really meal, just matches the type.
      // It merely contains a list of all the MealPlanRecipes in the meal plan.
      recipes: Meal
    }
  >({
    url: `mealplan/${selectedMealPlanId}`,
    weekDate: selectedWeekDate.toISO(),
  })

  useEffect(() => {
    if (allMealPlans && allMealPlans.length > 0) {
      setSelectedMealPlanId(allMealPlans[0].id)
    }
  }, [allMealPlans])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/meal-plan')
    }
  }, [status, router])

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
                    t={t}
                    meal={getMeal(date, mealType)}
                    editMealRecipe={(recipeId) => {}}
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
