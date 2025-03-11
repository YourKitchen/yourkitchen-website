'use client'
import {
  FormControl,
  InputLabel,
  TextField,
  type TextFieldProps,
} from '@mui/material'
import React, { type FC } from 'react'

const YKTextField: FC<TextFieldProps> = (props) => {
  return (
    <FormControl fullWidth key={`textfield-${props.key}-control`}>
      <TextField label={props.placeholder} {...props} />
    </FormControl>
  )
}

export default YKTextField
