import {
  FormControl,
  InputLabel,
  TextField,
  TextFieldProps,
} from '@mui/material'
import React, { FC } from 'react'

const YKTextField: FC<TextFieldProps> = (props) => {
  return (
    <FormControl fullWidth key={`textfield-${props.key}-control`}>
      <TextField label={props.placeholder} {...props} />
    </FormControl>
  )
}

export default YKTextField
