'use client'
import { MenuItem, Select, type SelectChangeEvent } from '@mui/material'
import { type Locale, localeNames, locales, usePathname, useRouter } from 'i18n'

export default function LocaleSwitcher({
  locale,
}: {
  locale: Locale
}) {
  const pathname = usePathname()
  const router = useRouter()

  // If the user chose Danish ("da"),
  // router.replace() will prefix the pathname
  // with this `newLocale`, effectively changing
  // languages by navigating to `/da/pathname`.
  const changeLocale = (event: SelectChangeEvent<unknown>) => {
    const newLocale = event.target.value as Locale
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <Select
      inputProps={{ MenuProps: { disableScrollLock: true }, name: 'locale' }}
      aria-label="Locale selector"
      variant="standard"
      size="small"
      sx={{
        fontSize: 12,
        backgroundColor: 'transparent',
        '& .MuiSelect-select': {
          backgroundColor: 'transparent',
        },
      }}
      disableUnderline
      value={locale}
      onChange={changeLocale}
      displayEmpty
    >
      {locales.map((loc) => (
        <MenuItem key={loc} value={loc}>
          {localeNames[loc]}
        </MenuItem>
      ))}
    </Select>
  )
}
