import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { t } from 'i18next'
import { DateTime } from 'luxon'
import { TFunction } from 'next-i18next'
import React, { FC } from 'react'

interface PreparationTimePickerProps {
  t: TFunction
  value: Date
  onChange: (date: Date) => void
}

const PreparationTimePicker: FC<PreparationTimePickerProps> = ({
  t,
  value,
  onChange,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TimePicker
        ampm={false}
        value={DateTime.fromJSDate(value)}
        onChange={(newValue) => newValue && onChange(newValue.toJSDate())}
        label={t('preparationTime')}
        sx={{
          width: '100%',
        }}
        closeOnSelect
      />
    </LocalizationProvider>
  )
}

export default PreparationTimePicker
