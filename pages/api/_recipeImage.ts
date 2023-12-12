import { ErrorResponse, PhotosWithTotalResults, createClient } from 'pexels'

const pexels = createClient(process.env.PEXELS_API_KEY ?? '')

export const getRecipeImage = async (name: string) => {
  const response = await pexels.photos.search({
    query: name,
    per_page: 1,
    orientation: 'square',
    size: 'small',
  } as any)

  if ((response as PhotosWithTotalResults).photos) {
    const { photos } = response as PhotosWithTotalResults

    // We only have 1 photo, so just return that.
    if (photos.length === 0) {
      throw new Error('Could not fetch image')
    }
    return photos[0]
  }
  // Must be error.
  const error = response as ErrorResponse
  throw new Error(error.error)
}
