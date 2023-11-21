import { Label } from '@mui/icons-material'
import {
  Box,
  Chip,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material'
import { Recipe, RecipeImage } from '@prisma/client'
import React, { FC, useEffect, useState } from 'react'
import { PublicRecipe } from '#pages/recipes'
import RecipeBox from './RecipeBox'
import SkeletonRecipeBox from './SkeletonRecipeBox'

interface ExploreRowProps {
  recipes: PublicRecipe[]
  loading: boolean
}

const skeletonData = new Array(20).fill({
  name: 'Lorem ipsum dolor sit amet',
  rating: 1,
})

const ExploreRow: FC<ExploreRowProps> = ({ recipes, loading }) => {
  return (
    <Box
      sx={{
        width: { sm: '100%', md: '100%' },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        overflowX: 'scroll',
        minHeight: '350px',
        marginBottom: 6,
      }}
    >
      {loading
        ? skeletonData.map((data) => (
            <SkeletonRecipeBox name={data.name} rating={data.rating} />
          ))
        : recipes.map((recipe) => (
            <RecipeBox key={recipe.id} recipe={recipe} />
          ))}
    </Box>
  )
}

export default ExploreRow
