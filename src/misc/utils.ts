/**
 * Converts a string to title case
 * @param str The string to convert
 * @returns The converted string
 */
export const toTitleCase = (str: string): string => {
  const s = str.replace(/([A-Z])/g, ' $1').trim()
  return s
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
