export const toTitleCase = () => {}

export const getIngredientId = (name: string): string => {
  return name
    .toLowerCase()
    .replaceAll(/ ?\(.*/g, '')
    .replaceAll(/[^\w\d\s]/g, '')
    .replaceAll(' ', '-')
}
