import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React, { type FC, type PropsWithChildren } from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('header')

  return {
    title: t('meal_plan'),
    description:
      'This page allows the user to navigate through their own as well as their followed meal plans.',
  }
}

const layout: FC<PropsWithChildren> = ({ children }) => {
  return children
}

export default layout
