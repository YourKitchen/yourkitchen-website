import { Circle, HorizontalRule, ThumbDown, ThumbUp } from '@mui/icons-material'
import { Box, Chip, Link, Typography } from '@mui/material'
import { Recipe, RecipeImage } from '@prisma/client'
import Image from 'next/image'
import React, { type FC, useMemo } from 'react'
import type { PublicRecipe } from '#models/publicRecipe'

interface RecipeBoxProps {
  recipe: PublicRecipe
}

/**
 * Component to show recipe on Explore Page
 */
const RecipeBox: FC<RecipeBoxProps> = ({ recipe }) => {
  const combinedRating = recipe.ratings.reduce(
    (prev, cur) => prev + cur.score,
    0,
  )

  let ratingColor: 'success' | 'primary' | 'error' = 'primary'
  let ratingIcon: JSX.Element = <Circle />

  if (combinedRating > 0) {
    ratingColor = 'success'
    ratingIcon = <ThumbUp />
  }
  if (combinedRating < 0) {
    ratingColor = 'error'
    ratingIcon = <ThumbDown />
  }

  const image = recipe.image?.[0] ?? null

  return (
    <Link
      sx={{
        display: 'inline-block',
        width: '225px',
        mr: 2,
        height: '300px',
        borderRadius: 4,
        backgroundColor: 'var(--mui-palette-background-paper)',
        backgroundImage: `url(${image?.link})`,
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px;',
        color: 'var(--mui-palette-text-primary)',

        transition: 'scale 0.24s',

        scale: 0.9,
        ':hover': {
          scale: 1.0,
        },

        '[data-mui-color-scheme="dark"] &': {
          boxShadow: 'none',
        },
      }}
      href={`/recipe/${recipe.id}`}
    >
      <Box
        sx={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '250px',
          height: '300px',
          position: 'absolute',
          display: 'flex',
          alignItems: 'end',
          padding: 2,
          gap: 2,

          background:
            'linear-gradient(0deg, rgba(255,255,255,0.75), transparent)',

          '[data-mui-color-scheme="dark"] &': {
            background: 'linear-gradient(0deg, rgba(0,0,0,0.25), transparent)',
          },
          textWrap: 'balance',
        }}
      >
        <Box>
          <Typography>{recipe.name}</Typography>
          {/* RATING */}
          <Chip color={ratingColor} icon={ratingIcon} label={combinedRating} />
        </Box>
      </Box>
    </Link>
  )
}

export default RecipeBox
