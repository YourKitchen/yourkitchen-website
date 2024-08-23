'use client'
import { Box } from '@mui/material'
import React, { type FC } from 'react'
import type { PublicRecipe } from '#models/publicRecipe'
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
    <Box>
      <Box
        sx={{
          paddingInline: '16px',
          width: '100%',
          display: 'block',
          whiteSpace: 'nowrap',
          alignItems: 'center',
          gap: 2,
          overflowX: 'scroll',
          minHeight: '350px',
          position: 'relative',
        }}
      >
        {loading
          ? skeletonData.map((data, index) => (
              <SkeletonRecipeBox
                key={`skeleton-${index}`}
                name={data.name}
                rating={data.rating}
              />
            ))
          : recipes.map((recipe) => (
              <RecipeBox key={recipe.id} recipe={recipe} />
            ))}
      </Box>
    </Box>
  )
}

export default ExploreRow
