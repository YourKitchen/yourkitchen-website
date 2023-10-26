import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { RecipeType } from '@prisma/client'
import { t } from 'i18next'
import { TFunction } from 'next-i18next'
import React, { FC } from 'react'

interface RecipeTypeSelectProps {
  t: TFunction
  value: RecipeType
  onChange: (recipeType: RecipeType) => void
}

const RecipeTypeSelect: FC<RecipeTypeSelectProps> = ({
  t,
  value,
  onChange,
}) => {
  return (
    <FormControl key="select-recipetype-control" fullWidth>
      <InputLabel id="select-recipetype">{`${t('select')} ${t(
        'recipeType',
      )}`}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as RecipeType)}
        labelId="select-recipetype"
        label={`${t('select')} ${t('recipeType')}`}
      >
        {[RecipeType.MAIN, RecipeType.SIDE].map((recipeType) => (
          <MenuItem key={recipeType} value={recipeType}>
            {t(recipeType.toLowerCase())}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default RecipeTypeSelect
