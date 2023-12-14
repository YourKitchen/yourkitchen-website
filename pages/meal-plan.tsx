import { api } from '#network/index'
import { Box } from '@mui/material'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { FC } from 'react'

const MealPlanPage: FC = () => {
  return <Box>MealPlanPage</Box>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const mealPlan = await api.get('database/mealplan/own')

  const locale = context.locale
  return {
    notFound: mealPlan === undefined,
    props: locale
      ? {
          mealPlan,
          ...(await serverSideTranslations(locale, [
            'common',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {
          mealPlan,
        },
  }
}

export default MealPlanPage
