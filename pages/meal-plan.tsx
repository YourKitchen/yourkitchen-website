import MealCell from '#components/MealPlan/MealCell'
import MealPicker from '#components/MealPlan/MealPicker'
import { WeekPicker } from '#components/MealPlan/WeekPicker'
import { Meal } from '#models/meal'
import { sameDate } from '#utils/meaplanHelper'
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { MealPlan, MealType, User } from '@prisma/client'
import { DateTime } from 'luxon'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
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

const MealPlanPage: FC<InferGetServerSidePropsType<typeof getServerSideProps>> =
  () => {
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

    return (
      <Box>
        <NextSeo
          title={t('meal_plan')}
          description="This page allows the user to navigate through their own as well as their followed meal plans."
          noindex
        />
        {mealPlanLoading ? (
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
        ) : (
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
                  <Box key={mealType}>
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
          </>
        )}
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
