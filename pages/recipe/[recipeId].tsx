import { Typography } from '@mui/material'
import { Recipe } from '@prisma/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import useSWR from 'swr'
import { YKResponse } from '#models/ykResponse'

/**
 * Visual representation of a recipe
 */
const RecipePage = () => {
  // Translations
  const { t } = useTranslation('common')

  const router = useRouter()

  const recipeId = useMemo(() => {
    return router.query.recipeId
  }, [router])

  const recipe = useSWR<YKResponse<Recipe>>(`recipe/${recipeId}`)

  if (!recipe) {
    return <Typography>{t('recipe_not_found')}</Typography>
  }

  return <div>{JSON.stringify(recipe)}</div>
}

export const getStaticPaths: GetStaticPaths<{ recipeId: string }> =
  async () => {
    return {
      paths: [], //indicates that no page needs be created at build time
      fallback: 'blocking', //indicates the type of fallback
    }
  }

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: locale
      ? {
          ...(await serverSideTranslations(locale, [
            'common',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {},
  }
}

export default RecipePage
