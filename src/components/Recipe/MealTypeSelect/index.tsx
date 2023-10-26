import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { MealType } from '@prisma/client'
import { t } from 'i18next'
import { TFunction } from 'next-i18next'
import React, { FC } from 'react'

interface MealTypeSelectProps {
  t: TFunction
  value: MealType
  onChange: (mealType: MealType) => void
}

const MealTypeSelect: FC<MealTypeSelectProps> = ({ t, value, onChange }) => {
  return (
    <FormControl key="select-mealtype-control" fullWidth>
      <InputLabel id="select-mealtype">{`${t('select')} ${t(
        'mealType',
      )}`}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as MealType)}
        labelId="select-mealtype"
        label={`${t('select')} ${t('mealType')}`}
      >
        {[MealType.DINNER, MealType.LUNCH, MealType.BREAKFAST].map(
          (mealType) => (
            <MenuItem key={mealType} value={mealType}>
              {t(mealType.toLowerCase())}
            </MenuItem>
          ),
        )}
      </Select>
    </FormControl>
  )
}

export default MealTypeSelect
