import { Circle, HorizontalRule, ThumbDown, ThumbUp } from '@mui/icons-material'
import { Box, Chip, Skeleton, Typography } from '@mui/material'
import { Recipe, RecipeImage } from '@prisma/client'
import Image from 'next/image'
import React, { FC, useMemo } from 'react'
import Link from '#components/Link'
import { PublicRecipe } from '#pages/recipes'

interface SkeletonRecipeBoxProps {
  name: string
  rating: number
}

/**
 * Component to show recipe on Explore Page
 */
const SkeletonRecipeBox: FC<SkeletonRecipeBoxProps> = ({ name, rating }) => {
  return (
    <Box
      sx={{
        display: 'block',
        width: '100%',
        minWidth: '250px',
        height: '300px',
        borderRadius: 4,
        backgroundColor: (theme) => theme.palette.background.paper,
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

export default SkeletonRecipeBox
