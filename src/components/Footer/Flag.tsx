import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import type { FC } from 'react'

export interface FlagProps {
  isoCountry: string
  label?: string
}

const Flag: FC<FlagProps> = async ({ isoCountry, label }) => {
  return (
    <Box sx={{ display: 'flex', my: 1, flexDirection: 'row' }}>
      <Image
        style={{
          borderRadius: '5px',
        }}
        height={25}
        width={30}
        alt={`Flag for the country ${isoCountry}`}
        src={`https://flagcdn.com/${isoCountry}.svg`}
      />
      {label && (
        <Typography sx={{ ml: 2 }} variant="body1">
          {label}
        </Typography>
      )}
    </Box>
  )
}

export default Flag
