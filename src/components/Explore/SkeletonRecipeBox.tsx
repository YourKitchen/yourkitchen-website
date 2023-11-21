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
        minWidth: '250px',
        minHeight: '300px',
        borderRadius: 4,
        backgroundColor: (theme) => theme.palette.background.paper,
        display: 'flex',
        justifyContent: 'end',
        flexDirection: 'column',
        padding: 2,
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
  )
}

export default SkeletonRecipeBox
