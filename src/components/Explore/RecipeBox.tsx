import { Circle, HorizontalRule, ThumbDown, ThumbUp } from '@mui/icons-material'
import { Box, Chip, Typography } from '@mui/material'
import { Recipe, RecipeImage } from '@prisma/client'
import Image from 'next/image'
import React, { FC, useMemo } from 'react'
import Link from '#components/Link'
import { PublicRecipe } from '#pages/recipes'

interface RecipeBoxProps {
  recipe: PublicRecipe
}

/**
 * Component to show recipe on Explore Page
 */
const RecipeBox: FC<RecipeBoxProps> = ({ recipe }) => {
  const combinedRating = useMemo(() => {
    return recipe.ratings.reduce((prev, cur) => prev + cur.score, 0)
  }, [recipe.ratings])

  const ratingColor = useMemo((): 'success' | 'primary' | 'error' => {
    if (combinedRating > 0) {
      return 'success'
    }
    if (combinedRating < 0) {
      return 'error'
    }

    return 'primary'
  }, [combinedRating])

  const ratingIcon = useMemo((): JSX.Element | undefined => {
    if (combinedRating > 0) {
      return <ThumbUp />
    }
    if (combinedRating < 0) {
      return <ThumbDown />
    }
    return <Circle />
  }, [combinedRating])

  const image = useMemo(() => {
    return recipe.image?.[0] ?? null
  }, [recipe.image])

  return (
    <Link
      sx={{
        display: 'block',
        width: '100%',
        maxWidth: '250px',
        height: '300px',
        borderRadius: 4,
        backgroundColor: (theme) => theme.palette.background.paper,
        backgroundImage: `url(${image?.link})`,
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.1) 0px 4px 12px;'
            : undefined,
        color: (theme) => theme.palette.text.primary,
      }}
      href={`/recipe/${recipe.id}`}
    >
      <Box
        sx={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'end',
          padding: 2,
          gap: 2,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(0deg, rgba(0,0,0,0.25), transparent)'
              : 'linear-gradient(0deg, rgba(255,255,255,0.75), transparent)',
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
