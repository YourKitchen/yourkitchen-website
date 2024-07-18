import { Box } from '@mui/material'
import React, { type FC } from 'react'
import type { PublicRecipe } from '#pages/recipes'
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
        display: 'block',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        gap: 2,
        overflowX: 'auto',
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
  )
}

export default ExploreRow
