import { BreadCrumbJsonLdProps } from 'next-seo'
import { JsonLdProps } from 'next-seo/lib/jsonld/jsonld'

declare module 'next-seo' {
  type Part = any

  interface MainEntity extends JsonLdProps {
    name: string
    agentInteractionStatistic?: (JsonLdProps & {
      interactionType:
        | 'https://schema.org/FollowAction'
        | 'https://schema.org/LikeAction'
        | 'https://schema.org/WriteAction'
        | 'https://schema.org/ShareAction'
      userInteraactionCount: number
    })[]
    alternateName?: string
    description?: string
    identifier?: string
    image?: string | string[]
    interactionStatistic?: (JsonLdProps & {
      interactionType:
        | 'https://schema.org/FollowAction'
        | 'https://schema.org/LikeAction'
        | 'https://schema.org/BefriendAction'
      userInteraactionCount: number
    })[]

    sameAs?: string[]
  }

  interface ProfilePageJsonLdProps extends JsonLdProps {
    breadcrump?: BreadCrumbJsonLdProps
    mainEntity: MainEntity
    dateCreated?: Date
    dateModified?: Date
    hasPart?: Part[]
  }
}
