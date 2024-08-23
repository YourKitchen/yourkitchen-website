'use client'
import {
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
} from '@mui/material'
import type { AllergenType, Ingredient } from '@prisma/client'
import type { TFunction } from 'next-i18next'
import React, { type FC, useState } from 'react'
import { toast } from 'sonner'
import { allAllergenes } from '#models/allergenes'
import type { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'

interface CreateIngredientDialogProps {
  t: TFunction
  open: boolean
  handleClose: (ingredient?: Ingredient) => void
  defaultValue: string
}

const CreateIngredientDialog: FC<CreateIngredientDialogProps> = ({
  t,
  open,
  handleClose,
  defaultValue,
}) => {
  const [ingredientName, setIngredientName] = useState(defaultValue)
  const [allergenTypes, setAllergenTypes] = useState<AllergenType[]>([])

  const handleSubmit = async () => {
    toast.promise(
      api.post<YKResponse<Ingredient>>('database/ingredient', {
        name: ingredientName,
        allergenTypes: allergenTypes,
      } as Ingredient),
      {
        loading: `${t('creating')} ${t('ingredient')}..`,
        error: (err) => err.message || err,
        success: (response) => {
          const ingredient = response.data.data

          handleClose(ingredient)

          return `${t('succesfully')} ${t('created')} ${t('ingredient')}`
        },
      },
    )
  }

  return (
    <Dialog open={open} onClose={() => handleClose(undefined)}>
      <DialogTitle>{t('create_ingredient')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          placeholder={t('name')}
        />
        <FormControl key="select-allergenes-control" fullWidth>
          <InputLabel id="select-allergenes">{`${t('select')} ${t(
            'allergenes',
          )}`}</InputLabel>

          <Select
            labelId="select-allergenes"
            label={`${t('select')} ${t('allergenes')}`}
            fullWidth
            value={allergenTypes}
            multiple
            onChange={(e) => setAllergenTypes(e.target.value as AllergenType[])}
          >
            {allAllergenes.map((allergen) => (
              <MenuItem key={allergen} value={allergen}>
                {t(allergen.toLowerCase())}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(undefined)}>{t('cancel')}</Button>
        <Button onClick={handleSubmit}>{t('submit')}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateIngredientDialog
