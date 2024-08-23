'use client'
import { ArrowDownward } from '@mui/icons-material'
import {
  Badge,
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  Popper,
  Select,
  Slider,
  debounce,
} from '@mui/material'
import { type Cuisine, MealType } from '@prisma/client'
import { useTranslation } from 'next-i18next'
import React, {
  type FC,
  type MouseEvent,
  type PropsWithChildren,
  useMemo,
  useState,
} from 'react'
import useSWR from 'swr'
import type { PublicRecipe } from '#models/publicRecipe'
import type { YKResponse } from '#models/ykResponse'
import RecipeBox from '../RecipeBox'
import GridSkeletonRecipeBox from './GridSkeletonBox'

interface SearchResultsProps {
  value: string
  cuisines: Cuisine[]
}

interface FilterPopperProps {
  label: string
  value?: string
  changed?: boolean
  values?: { value: string; label?: string }[]
  onValueSelected?: (value: string) => void
}

const skeletonData = new Array(10).fill({
  name: 'Lorem ipsum dolor sit amet',
  rating: 1,
})

const FilterPopper: FC<PropsWithChildren<FilterPopperProps>> = ({
  children,
  label,
  changed,
  value: selectedValue,
  values,
  onValueSelected,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLButtonElement) | null
  >(null)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box>
      <Badge color="secondary" variant="dot" invisible={!changed}>
        <Button
          sx={{
            padding: 1,
          }}
          onClick={handleClick}
        >
          {label} <ArrowDownward />
        </Button>
      </Badge>
      <Popper open={open} anchorEl={anchorEl}>
        <Box
          sx={{
            borderRadius: 2,
            backgroundColor: 'var(--mui-palette-background-paper)',
          }}
        >
          {values ? (
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {values.map((value) => (
                <MenuItem
                  key={value.value}
                  onClick={() => {
                    handleClose()
                    onValueSelected?.(value.value)
                  }}
                  sx={{
                    backgroundColor:
                      value.value === selectedValue
                        ? 'var(--mui-palette-primary-main)'
                        : undefined,
                    color:
                      value.value === selectedValue
                        ? 'var(--mui-palette-primary-contrastText)'
                        : undefined,
                  }}
                >
                  {value.label ?? value.value}
                </MenuItem>
              ))}
            </Menu>
          ) : (
            children
          )}
        </Box>
      </Popper>
    </Box>
  )
}

const SearchResults: FC<SearchResultsProps> = ({ value, cuisines }) => {
  // Translations
  const { t } = useTranslation('common')

  // Filters
  const [cuisine, setCuisine] = useState<Cuisine>()
  const [mealType, setMealType] = useState<MealType>()
  const [maxPrepTime, setMaxPrepTime] = useState<number>(150)

  // Search Results
  const { data: searchRecipes, isValidating: searchLoading } = useSWR<
    YKResponse<PublicRecipe[]>
  >(
    value.length >= 2
      ? {
          url: 'recipe/search',
          searchTerm: value,
          cuisine: cuisine?.name,
          mealType,
          preparationTime: maxPrepTime < 150 ? maxPrepTime : undefined,
        }
      : null,
  )

  return (
    <>
      {/* SEARCH FILTERS */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
        }}
      >
        <FilterPopper
          label={t('preparation_time')}
          changed={maxPrepTime !== 150}
        >
          <Slider
            aria-label="Preparation Time"
            sx={{
              width: '200px',
              marginInline: 3,
            }}
            defaultValue={150}
            valueLabelDisplay="on"
            valueLabelFormat={(value) =>
              value === 150
                ? '2:30+'
                : `${Math.floor(value / 60.0)}:${Math.floor(value % 60.0)}`
            }
            onChangeCommitted={(_, newValue) =>
              setMaxPrepTime(newValue as number)
            }
            step={15}
            min={30}
            max={150}
          />
        </FilterPopper>
        <FilterPopper
          label={t('meal_type')}
          value={mealType}
          changed={mealType !== undefined}
          values={[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map(
            (val) => ({ value: val, label: t(val.toLowerCase()) }),
          )}
          onValueSelected={(newValue) => setMealType(newValue as MealType)}
        />
        <FilterPopper
          label={t('cuisine')}
          value={cuisine?.name}
          changed={cuisine !== undefined}
          values={cuisines.map((val) => ({
            value: val.name,
            label: t(val.name),
          }))}
          onValueSelected={(newValue) => setCuisine({ name: newValue })}
        />
      </Box>
      {/* SEARCH RESULTS */}
      {searchLoading ? (
        <Grid sx={{ margin: 0 }} container spacing={8}>
          {skeletonData.map((data, index) => (
            <Grid
              key={`skeleton-${index}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <GridSkeletonRecipeBox
                key={`skeleton-${index}`}
                name={data.name}
                rating={data.rating}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid sx={{ margin: 0 }} container spacing={8}>
          {searchRecipes?.data.map((recipe) => (
            <Grid
              key={recipe.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <RecipeBox recipe={recipe} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )
}

export default SearchResults
