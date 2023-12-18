import { Button, ButtonProps, Popper } from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  DateCalendar,
  DateCalendarProps,
  PickersDayProps,
} from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import { DateTime } from 'luxon'
import { TFunction } from 'next-i18next'
import { FC, MouseEventHandler, useState } from 'react'

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered',
})<PickersDayProps<DateTime> & { isHovered: boolean; isSelected: boolean }>(
  ({ theme, isSelected, isHovered, day }) => ({
    borderRadius: 0,
    ...(isSelected && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
      },
    }),
    ...(isHovered && {
      backgroundColor: theme.palette.primary[theme.palette.mode],
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary[theme.palette.mode],
      },
    }),
    ...(day.get('weekday') === 1 && {
      borderTopLeftRadius: '50%',
      borderBottomLeftRadius: '50%',
    }),
    ...(day.get('weekday') === 7 && {
      borderTopRightRadius: '50%',
      borderBottomRightRadius: '50%',
    }),
  }),
)

const isInSameWeek = (dayA: DateTime, dayB: DateTime | null) => {
  if (dayB == null) {
    return false
  }

  return dayA.hasSame(dayB, 'week')
}

interface DayProps {
  selectedDay: DateTime | null
  hoveredDay: DateTime | null
}

const Day: FC<PickersDayProps<DateTime> & DayProps> = (props) => {
  const { day, selectedDay, hoveredDay, ...other } = props

  return (
    <CustomPickersDay
      {...(other as any)}
      day={day as any}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false}
      isSelected={isInSameWeek(day, selectedDay)}
      isHovered={isInSameWeek(day, hoveredDay)}
    />
  )
}

export const WeekPicker: FC<{
  weekPickerProps?: DateCalendarProps<DateTime>
  buttonProps?: ButtonProps
  t: TFunction
  value: DateTime
  onChange: (value: DateTime | null) => void
}> = ({ t, weekPickerProps, buttonProps, value, onChange }) => {
  const [hoveredDay, setHoveredDay] = useState<DateTime | null>(null)
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null)

  const handleClick: MouseEventHandler = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  return (
    <>
      <Button {...buttonProps} onClick={handleClick}>{`${t(
        'week',
      )} #${value?.toFormat('W')}`}</Button>
      <Popper
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRadius: 2,
          padding: 1,
        }}
        open={anchorEl !== null}
        anchorEl={anchorEl}
      >
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <DateCalendar
            {...weekPickerProps}
            value={value}
            onChange={(newValue) => {
              onChange(newValue) // Set new value
              setAnchorEl(null) // Close popper
            }}
            minDate={DateTime.utc().startOf('week')}
            showDaysOutsideCurrentMonth
            displayWeekNumber
            slots={{ day: (dayProps: any) => <Day {...dayProps} /> }}
            slotProps={{
              day: (ownerState) => ({
                selectedDay: value,
                hoveredDay,
                onPointerEnter: () => setHoveredDay(ownerState.day),
                onPointerLeave: () => setHoveredDay(null),
              }),
            }}
          />
        </LocalizationProvider>
      </Popper>
    </>
  )
}
