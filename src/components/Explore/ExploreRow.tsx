import { Box } from '@mui/material'
import React, { type FC } from 'react'
import type { PublicRecipe } from '#models/publicRecipe'
import RecipeBox from './RecipeBox'

interface ExploreRowProps {
  recipes: PublicRecipe[]
}

const ExploreRow: FC<ExploreRowProps> = ({ recipes }) => {
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
        {recipes.map((recipe) => (
          <RecipeBox key={recipe.id} recipe={recipe} />
        ))}
      </Box>
    </Box>
  )
}

export default ExploreRow
