import { api } from '#network/index'
import { Comment } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Rating as MuiRating,
  TextField,
} from '@mui/material'
import { Rating, Recipe } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { TFunction } from 'next-i18next'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

interface RecipeRatingProps {
  t: TFunction
  recipe: Recipe & { rating: number }
}

const RecipeRating: FC<RecipeRatingProps> = ({ t, recipe }) => {
  const { data: session } = useSession()

  // Get the user's rating for this recipe if any.
  const { data: rating, mutate } = useSWR<Rating>(
    session ? `recipe/${recipe.id}/rating/own` : null,
  )

  // States
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [dialogValue, setDialogValue] = useState<{
    score: number | null
    message: string
  }>({ score: rating?.score ?? 0, message: rating?.message ?? '' })

  useEffect(() => {
    setDialogValue({
      score: rating?.score ?? 0,
      message: rating?.message ?? '',
    })
  }, [rating])

  const handleChange = async (newValue: number | null, message?: string) => {
    toast.promise(
      api.put<Rating>(`database/recipe/${recipe.id}/rating/own`, {
        score: newValue ?? 0,
        message,
      }),
      {
        loading: `${t('updating')} ${t('rating')}..`,
        error: (err) => err.message ?? err,
        success: (response) => {
          const data = response.data
          mutate(data)

          return `${t('succesfully')} ${t('updated')} ${t('rating')}`
        },
      },
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Dialog fullWidth maxWidth="sm" open={commentDialogOpen}>
        <DialogTitle>{t('rating')}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box>
              <MuiRating
                name="recipe-rating"
                value={dialogValue.score}
                color={rating ? 'success' : undefined}
                size="large"
                onChange={(_e, newValue) =>
                  setDialogValue((prev) => ({ ...prev, score: newValue }))
                }
                precision={0.25}
              />
            </Box>
            <TextField
              placeholder={t('message')}
              value={dialogValue.message}
              onChange={(e) =>
                setDialogValue((prev) => ({ ...prev, message: e.target.value }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => handleChange(dialogValue.score, dialogValue.message)}
          >
            {t('submit')}
          </Button>
        </DialogActions>
      </Dialog>
      <MuiRating
        name="recipe-rating"
        value={recipe.rating ?? rating?.score ?? 0}
        color={rating ? 'success' : undefined}
        size="large"
        onChange={(_e, newValue) => handleChange(newValue)}
        precision={0.25}
        readOnly={!session}
      />
      {session && (
        <IconButton onClick={() => setCommentDialogOpen(true)}>
          <Comment />
        </IconButton>
      )}
    </Box>
  )
}

export default RecipeRating
