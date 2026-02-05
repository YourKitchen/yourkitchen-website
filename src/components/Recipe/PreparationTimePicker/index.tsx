'use client'
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateTime } from 'luxon'
import { type FC, useMemo } from 'react'
import type { TFunction } from '#models/TFunction'

interface PreparationTimePickerProps {
  t: TFunction
  value: number
  onChange: (date: Date) => void
}

const PreparationTimePicker: FC<PreparationTimePickerProps> = ({
  t,
  value,
  onChange,
}) => {
  const dateValue = useMemo(() => {
    const hours = Math.floor(value / 60.0)
    const minutes = value % 60

    return DateTime.fromObject({
      hour: hours,
      minute: minutes,
    })
  }, [value])

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TimePicker
        ampm={false}
        value={dateValue}
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
