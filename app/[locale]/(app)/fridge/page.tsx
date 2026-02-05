'use client'
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  debounce,
} from '@mui/material'
import type {
  Fridge,
  FridgeIngredient,
  Ingredient,
} from 'prisma/generated/prisma/client'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type FC, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import CreateIngredientDialog from '#components/Recipe/StepsTextField/CreateIngredientDialog'
import type { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import { validUnits } from '#utils/validator'
import { Unit } from 'prisma/generated/prisma/enums'

const FridgePage: FC = () => {
  // Translations
  const t = useTranslations('common')

  useSession({
    required: true,
  })

  // States
  const [createIngredientValue, setCreateIngredientValue] = useState<
    string | null
  >(null)
  const [searchIngredient, setSearchIngredient] = useState<
    (FridgeIngredient & { ingredient: Ingredient }) | null
  >(null)

  // Search
  const [value, setValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>()

  const setValueDelayed = useMemo(() => debounce(setSearchValue, 250), [])

  // Data
  const { data: fridge, mutate } = useSWR<
    Fridge & { ingredients: (FridgeIngredient & { ingredient: Ingredient })[] }
  >('fridge')
  const { data: suggestions } = useSWR<YKResponse<Ingredient[]>>(
    searchValue ? { url: 'ingredient/search', searchTerm: searchValue } : null,
  )

  const ingredientAutoComplete = (
    <Autocomplete
      fullWidth
      sx={{ mt: 2, flex: 1 }}
      value={value}
      onInputChange={(_e, newValue) => {
        // Refresh suggestions
        setValueDelayed(newValue)

        // Set input field value
        setValue(newValue)
      }}
      onChange={(_e, newValue) => {
        const ingredient = suggestions?.data.find(
          (suggestion) => suggestion.name === newValue,
        )

        if (ingredient && fridge) {
          setSearchIngredient({
            fridgeId: fridge.id,
            ingredientId: ingredient.id,
            ingredient,
            amount: 0,
            unit: Unit.PIECE,
          })
        }
      }}
      options={suggestions?.data.map((suggestion) => suggestion.name) ?? []}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField {...params} label={t('search')} />
      )}
      noOptionsText={
        <Button
          color="primary"
          fullWidth
          onClick={() => {
            // if (
            //   session?.user.role !== 'ADMIN' &&
            //   (session?.user.score ?? 0) < 5
            // ) {
            //   toast.error(`${t('need_score_of')} 5`)
            //   return
            // }
            setCreateIngredientValue(value)
          }}
        >
          {t('add_new')}
        </Button>
      }
    />
  )

  const addIngredient = (
    ingredient: FridgeIngredient & { ingredient: Ingredient },
  ) => {
    if (ingredient.amount === 0) {
      toast.error('Amount cannot be 0')
      return
    }

    toast.promise(
      api.put('database/fridge', {
        add: ingredient,
      }),
      {
        loading: `${t('adding')} ${t('ingredient')}..`,
        error: (err) => err.message ?? err,
        success: () => {
          mutate()

          setValue('')
          setValueDelayed('')
          setSearchIngredient(null)

          return `${t('succesfully')} ${t('added')} ${t('ingredient')}`
        },
      },
    )
  }

  const closeAdditionalInformation = () => {
    setSearchIngredient(null)
  }

  return (
    <Box
      sx={{
        margin: '16px 32px',
      }}
    >
      <Dialog
        open={!!searchIngredient}
        onClose={closeAdditionalInformation}
        onSubmit={() => searchIngredient && addIngredient(searchIngredient)}
      >
        <DialogTitle>{t('additional_information')}</DialogTitle>
        {searchIngredient && (
          <DialogContent>
            {ingredientAutoComplete}
            <TextField
              autoFocus
              placeholder={t('amount')}
              fullWidth
              sx={{
                flex: 1,
                my: 1,
                borderRadius: '20px',
              }}
              value={searchIngredient.amount}
              onChange={(e) =>
                setSearchIngredient((prev) =>
                  prev
                    ? {
                        ...prev,
                        amount: Number(e.target.value),
                      }
                    : null,
                )
              }
              type="number"
            />
            <FormControl key="select-unit-control" fullWidth>
              <InputLabel id="select-unit">{`${t('select')} ${t(
                'unit',
              )}`}</InputLabel>
              <Select
                fullWidth
                value={searchIngredient.unit}
                onChange={(e) =>
                  setSearchIngredient((prev) =>
                    prev
                      ? {
                          ...prev,
                          unit: e.target.value as Unit,
                        }
                      : null,
                  )
                }
                labelId="select-unit"
                label={`${t('select')} ${t('unit')}`}
              >
                {validUnits?.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {t(unit.toLowerCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogActions>
              <Button onClick={closeAdditionalInformation}>
                {t('cancel')}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => addIngredient(searchIngredient)}
              >
                {t('add')}
              </Button>
            </DialogActions>
          </DialogContent>
        )}
      </Dialog>
      {createIngredientValue && (
        <CreateIngredientDialog
          t={t}
          defaultValue={createIngredientValue}
          open={createIngredientValue !== null}
          handleClose={(newIngredient) => {
            if (newIngredient && fridge) {
              setSearchIngredient({
                fridgeId: fridge.id,
                ingredientId: newIngredient.id,
                ingredient: newIngredient,
                amount: 0,
                unit: Unit.PIECE,
              })
            }
            setCreateIngredientValue(null)
          }}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h2" sx={{ flex: 1 }}>
          {t('fridge')}
        </Typography>
        {ingredientAutoComplete}
      </Box>
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        {fridge?.ingredients.map((fridgeIngredient) => {
          const ingredient = fridgeIngredient.ingredient
          return (
            <Box
              key={fridgeIngredient.ingredientId}
              sx={{
                width: 100,
                height: 100,
                margin: 1,
              }}
            >
              <Typography
                sx={{
                  textOverflow: 'ellipsis',
                }}
              >
                {ingredient.name}
              </Typography>
              <Typography variant="subtitle1">{`${fridgeIngredient.amount} ${fridgeIngredient.unit}`}</Typography>
            </Box>
          )
        })}
      </Box>
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          gap: 2,
        }}
      >
        {fridge?.ingredients.map((fridgeIngredient) => {
          const ingredient = fridgeIngredient.ingredient
          return (
            <Box
              key={fridgeIngredient.ingredientId}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Typography>{ingredient.name}</Typography>
              <Typography variant="subtitle1">{`${fridgeIngredient.amount} ${fridgeIngredient.unit}`}</Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default FridgePage
