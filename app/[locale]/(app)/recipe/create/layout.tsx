import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { FC, PropsWithChildren } from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('header')

  return {
    title: t('create_recipe'),
    description:
      'This page allows the user to create a new recipe to add to their recipe collection. This recipe can also be public.',
  }
}

const layout: FC<PropsWithChildren> = ({ children }) => {
  return children
}

export default layout
