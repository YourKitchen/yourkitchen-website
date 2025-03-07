'use client'
import { Chip, type ChipProps } from '@mui/material'
import React, { type FC } from 'react'

const YKChip: FC<ChipProps> = (props) => {
  return <Chip {...props} variant="filled" color="primary" />
}

export default YKChip
