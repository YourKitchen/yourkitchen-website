import { MenuItem, Select } from '@mui/material'
import router, { useRouter } from 'next/router'
import Flag from './Flag'

const LanguageSelect = () => {
  const { pathname, asPath, query, locale: defaultLocale } = useRouter()

  const handleChange = async (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`

    // TODO: Find a solution that does not require a reload

    // First we change the route to the new locale.
    await router.push({ pathname, query }, asPath, { locale })
    // After this we reload the page to get the serverside props for the new locale.
    router.reload()
  }

  return (
    <Select
      aria-label="Locale selector"
      variant="standard"
      disableUnderline
      sx={{
        height: '40.5px',
        borderRadius: '10px',
      }}
      defaultValue={defaultLocale || 'en'}
      onChange={(e) => handleChange(e.target.value as string)}
    >
      <MenuItem key="en" value="en">
        <Flag isoCountry="gb" />
      </MenuItem>
      <MenuItem key="da" value="da">
        <Flag isoCountry="dk" />
      </MenuItem>
    </Select>
  )
}

export default LanguageSelect
