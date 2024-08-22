import {
  DocumentHeadTags,
  type DocumentHeadTagsProps,
  documentGetInitialProps,
} from '@mui/material-nextjs/v14-pagesRouter'
import InitColorSchemeScript from '@mui/system/InitColorSchemeScript'
import {
  type DocumentContext,
  DocumentInitialProps,
  type DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'

export const Document = (props: DocumentProps & DocumentHeadTagsProps) => {
  return (
    <Html lang="en">
      <Head>
        <DocumentHeadTags {...props} />
      </Head>
      <body>
        <InitColorSchemeScript defaultMode="system" />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx)

  return finalProps
}

export default Document
