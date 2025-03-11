'use client'
import YKTextField from '#components/General/YKTextField'
import CuisineAutocomplete from '#components/Recipe/CuisineAutocomplete'
import ImageSelect from '#components/Recipe/ImageSelect'
import MealTypeSelect from '#components/Recipe/MealTypeSelect'
import PreparationTimePicker from '#components/Recipe/PreparationTimePicker'
import RecipeTypeSelect from '#components/Recipe/RecipeTypeSelect'
import StepsTextField from '#components/Recipe/StepsTextField'
import type { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import type { Recipe, RecipeImage, RecipeIngredient } from '@prisma/client'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { NextSeo } from 'next-seo'
import { redirect, useRouter } from 'next/navigation'
import { type FC, useState } from 'react'
import { toast } from 'sonner'
import { getGetIngredientsFromStep } from 'src/utils'
import { validateContent, ValidationError } from 'src/utils/validator'
import { v4 } from 'uuid'

const defaultRecipe: Recipe & {
  ingredients: RecipeIngredient[]
  image: (RecipeImage & { file?: File })[]
} = {
  id: v4(),

  name: '',
  description: '',
  mealType: 'DINNER',
  persons: 4,
  preparationTime: 60,
  recipeType: 'MAIN',

  steps: [''],
  ingredients: [],
  cuisineName: '',
  image: [],

  // Will be overwritten by server anyways
  ownerId: '',
  updated: new Date(),
  created: new Date(),
}

const CreateRecipePage: FC = () => {
  // Translations
  const t = useTranslations('common')
  // Auth
  const { data: session, status } = useSession({
    required: true,
  })

  const router = useRouter()

  // States
  const [importOpen, setImportOpen] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [recipe, setRecipe] = useState(defaultRecipe)

  const [stepList, setStepList] = useState<{ key: string; value: string }[]>(
    recipe.steps.map((step) => ({
      key: v4(),
      value: step,
    })),
  )

  if (status === 'loading' || !session) {
    return <CircularProgress />
  }

  const submit = async () => {
    const formattedRecipe = recipe

    formattedRecipe.steps = stepList.map((step) => step.value)

    toast.promise(
      async () => {
        if (recipe.image.length === 0) {
          throw new Error('No image(s) not selected')
        }
        // Extract ingredients from steps.
        formattedRecipe.ingredients = recipe.steps.flatMap((step) =>
          getGetIngredientsFromStep(step, recipe.id),
        )

        // We validate the recipe before beginning any kind of upload.
        const validatedRecipe = validateContent(formattedRecipe)

        // Upload all images that contain files.
        const responses: RecipeImage[] = await Promise.all(
          recipe.image.map(async (image) => {
            if (image.file) {
              // Upload new file
              const uploadResponse = await api.post<YKResponse<string>>(
                'database/recipe/image',
                image.file,
                {
                  params: {
                    recipeId: image.recipeId,
                    id: image.id,
                  },
                },
              )

              image.link = uploadResponse.data.data
            }

            return image
          }),
        )

        formattedRecipe.image = responses

        return api.post<YKResponse<Recipe>>('database/recipe', validatedRecipe)
      },
      {
        loading: `${t('creating')} ${t('recipe')}..`,
        error: (err) => {
          if (err instanceof ValidationError) {
            console.error(
              `This object caused the error ${err.message}`,
              err.object,
            )
          } else {
            console.error(err)
          }

          return err.message ?? err
        },
        success: (response) => {
          // Navigate to the newly created recipe.
          router.push(`recipe/${response.data.data.id}`)

          return response.data.message
        },
      },
    )
  }

  const handleImportClose = () => {
    setImportOpen(false)
  }

  const handleImportSubmit = () => {
    toast.promise(
      async () => {
        // We do this client side to prevent SSRF attacks
        const contentResponse = await axios.get(importUrl, {
          headers: {
            Accept: 'text/html',
          },
        })
        return api.get<
          YKResponse<
            Recipe & {
              ingredients: RecipeIngredient[]
              image: (RecipeImage & { file?: File })[]
            }
          >
        >('database/recipe/structured-data', {
          params: {
            content: contentResponse.data,
          },
        })
      },
      {
        loading: t('importing_recipe'),
        error: (err) => err.message ?? err,
        success: (response) => {
          const data = response.data.data

          setRecipe(data)
          setStepList(
            data.steps.map((step) => ({
              key: v4(),
              value: step,
            })),
          )

          handleImportClose()

          return t('succesfully_imported_recipe')
        },
      },
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={importOpen}
        onClose={handleImportClose}
      >
        <DialogTitle>{t('import_recipe')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('import_recipe_description')}
          </DialogContentText>
          <TextField
            fullWidth
            value={importUrl}
            placeholder={t('import_url')}
            type="url"
            onChange={(e) => setImportUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportClose}>{t('cancel')}</Button>
          <Button color="success" onClick={handleImportSubmit}>
            {t('submit')}
          </Button>
        </DialogActions>
      </Dialog>
      <Box
        sx={{
          width: {
            xs: '100%',
            sm: '400px',
          },
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography sx={{ mb: 2 }} variant="h3">
          {t('create_recipe')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setImportOpen(true)}
          fullWidth
        >
          {t('import_recipe')}
        </Button>
        <Typography>{t('or')}</Typography>
        <YKTextField
          value={recipe.name}
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }}
          placeholder={t('name')}
        />
        <YKTextField
          value={recipe.description}
          multiline
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }}
          placeholder={t('description')}
        />
        <ImageSelect
          t={t}
          recipeId={recipe.id}
          value={recipe.image}
          onChange={(images) =>
            setRecipe((prev) => ({
              ...prev,
              image: images,
            }))
          }
        />
        <Box
          sx={{
            width: '100%',
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <CuisineAutocomplete
            t={t}
            defaultCuisine={recipe.cuisineName}
            onChange={(cuisine) =>
              setRecipe((prev) => ({
                ...prev,
                cuisineName: cuisine?.name ?? '',
              }))
            }
          />
          <MealTypeSelect
            t={t}
            value={recipe.mealType}
            onChange={(mealType) =>
              setRecipe((prev) => ({ ...prev, mealType }))
            }
          />
          <YKTextField
            value={recipe.persons}
            onChange={(e) => {
              setRecipe((prev) => ({
                ...prev,
                persons: Number.parseInt(e.target.value),
              }))
            }}
            type="number"
            placeholder={t('persons')}
          />
          <RecipeTypeSelect
            t={t}
            value={recipe.recipeType}
            onChange={(recipeType) => {
              setRecipe((prev) => ({
                ...prev,
                recipeType,
              }))
            }}
          />
          <PreparationTimePicker
            t={t}
            value={recipe.preparationTime}
            onChange={(preparationTime) => {
              const totalMinutes =
                preparationTime.getHours() * 60 + preparationTime.getMinutes()
              setRecipe((prev) => ({
                ...prev,
                preparationTime: totalMinutes,
              }))
            }}
          />
        </Box>
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 1,
          }}
        >
          {stepList.map((step, index) => (
            <StepsTextField
              key={step.key}
              t={t}
              index={index}
              length={stepList.length}
              deleteStep={() => {
                setStepList((prev) =>
                  prev.filter((prevStep) => prevStep.key !== step.key),
                )
              }}
              value={step.value}
              setValue={(value) => {
                setStepList((prev) =>
                  prev.map((prevStep) =>
                    prevStep.key === step.key
                      ? { key: step.key, value }
                      : prevStep,
                  ),
                )
              }}
            />
          ))}
          {/* Add step button */}
          <Button
            sx={{
              mt: 1,
            }}
            fullWidth
            onClick={() => {
              setStepList((prev) => [...prev, { key: v4(), value: '' }])
            }}
          >
            {t('add_step')}
          </Button>
        </Box>
        <Button
          sx={{
            mt: 2,
          }}
          variant="contained"
          onClick={submit}
        >
          {t('create')}
        </Button>
      </Box>
    </Box>
  )
}

export default CreateRecipePage
