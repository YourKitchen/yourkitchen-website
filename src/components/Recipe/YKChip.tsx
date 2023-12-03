import { Chip, ChipProps } from '@mui/material'
import React, { FC } from 'react'

const YKChip: FC<ChipProps> = (props) => {
  return <Chip {...props} variant="filled" color="primary" />
}

export default YKChip
