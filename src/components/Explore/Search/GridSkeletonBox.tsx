import { Circle } from '@mui/icons-material'
import { Box, Chip, Skeleton, Typography } from '@mui/material'
import type { FC } from 'react'

interface GridSkeletonRecipeBoxProps {
  name: string
  rating: number
}

/**
 * Component to show recipe on Explore Page
 */
const GridSkeletonRecipeBox: FC<GridSkeletonRecipeBoxProps> = async ({
  name,
  rating,
}) => {
  return (
    <Box
      sx={{
        display: 'block',
        width: '100%',
        maxWidth: '250px',
        height: '300px',
        borderRadius: 4,
        backgroundColor: 'var(--mui-palette-background-paper)',
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'end',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Skeleton variant="rectangular">
          <Typography>{name}</Typography>
        </Skeleton>
        <Skeleton variant="rectangular">
          <Chip icon={<Circle />} label={rating} />
        </Skeleton>
      </Box>
    </Box>
  )
}

export default GridSkeletonRecipeBox
