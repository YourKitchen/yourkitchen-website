'use client'
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { type MealPlan, MealType, type User } from '@prisma/client'
import { DateTime } from 'luxon'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { NextSeo } from 'next-seo'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import MealCell from '#components/MealPlan/MealCell'
import MealPicker from '#components/MealPlan/MealPicker'
import { WeekPicker } from '#components/MealPlan/WeekPicker'
import type { Meal } from '#models/meal'
import { sameDate } from '#utils/meaplanHelper'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const MealPlanPage: FC = () => {
  // Translations
  const t = useTranslations('common')

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

  // Data
  const { data: allMealPlans } =
    useSWR<(MealPlan & { owner: User })[]>('mealplan')
  const {
    data: selectedMealPlan,
    mutate: updateMealPlan,
    isLoading: mealPlanLoading,
  } = useSWR<
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

  if (mealPlanLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mx: 6,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mx: 6,
        }}
      >
        <MealPicker
          t={t}
          editMealPosition={editMealPosition}
          setEditMealPosition={setEditMealPosition}
          updateMealPlan={updateMealPlan}
        />
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
      <TableContainer>
        <Table>
          {/* Representation of meal plan (Calendar view for the week) */}
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Typography
                  sx={{
                    textAlign: 'center',
                    fontSize: '20px',
                  }}
                >
                  {t('meal')}
                </Typography>
              </TableCell>
              {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map(
                (mealType) => (
                  <TableCell align="center" key={mealType}>
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontSize: '25px',
                        fontWeight: 'bold',
                      }}
                    >
                      {t(mealType.toLowerCase())}
                    </Typography>
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {daysOfWeek.map((dayOfWeek, index) => {
              const date = datesOfWeek[index]

              return (
                <TableRow key={`${date.toISO()}`}>
                  <TableCell key={dayOfWeek}>
                    <Typography>{date.toFormat('EEEE')}</Typography>
                    <Typography variant="subtitle1">
                      {date.toFormat('dd MMM')}
                    </Typography>
                  </TableCell>
                  {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map(
                    (mealType) => (
                      <TableCell
                        key={`${date.toFormat('dd-MM-yyyy')}_${mealType}`}
                      >
                        <MealCell
                          t={t}
                          meal={getMeal(date, mealType)}
                          editMealRecipe={() => {
                            setEditMealPosition({
                              date,
                              meal: mealType,
                            })
                          }}
                        />
                      </TableCell>
                    ),
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default MealPlanPage
