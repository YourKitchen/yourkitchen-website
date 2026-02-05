'use client'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { FC } from 'react'
import type { TFunction } from '#models/TFunction'
import { RecipeType } from 'prisma/generated/prisma/enums'

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
