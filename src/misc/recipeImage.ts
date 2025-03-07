import {
  type ErrorResponse,
  type Photo,
  type PhotosWithTotalResults,
  createClient,
} from 'pexels'

const pexels = createClient(process.env.PEXELS_API_KEY ?? '')

export const getRecipeImage = async (
  name: string,
  per_page = 1,
): Promise<Photo[]> => {
  const response = await pexels.photos.search({
    query: name,
    per_page,
  } as any)

  if ((response as PhotosWithTotalResults).photos) {
    const { photos } = response as PhotosWithTotalResults

    // We only have 1 photo, so just return that.
    if (per_page === 1 && photos.length === 0) {
      throw new Error('Could not fetch image')
    }
    return photos
  }
  // Must be error.
  const error = response as ErrorResponse
  throw new Error(error.error)
}
