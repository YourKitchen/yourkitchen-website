import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { AllergenType } from '@prisma/client'
import { TFunction } from 'next-i18next'
import { FC, useEffect, useMemo, useState } from 'react'
import AccountBox from './AccountBox'

interface AccountCell<T = any> {
  field: keyof T
  label: string
  type?: 'string' | 'number' | 'allergenes'
  disabled?: boolean
}

interface AccountUpdateBoxProps<T = any> {
  t: TFunction
  label: string
  defaultObject: T
  onSave?: (object: T) => PromiseLike<void>
  cells: AccountCell<T>[]
}

const allAllergenes: AllergenType[] = [
  AllergenType.CELERY,
  AllergenType.EGGS,
  AllergenType.FISH,
  AllergenType.GLUTEN,
  AllergenType.LACTOSE,
  AllergenType.LUPIN,
  AllergenType.MOLLUSKUS,
  AllergenType.MUSTARD,
  AllergenType.NUT,
  AllergenType.PEANUTS,
  AllergenType.SESAME,
  AllergenType.SHELLFISH,
  AllergenType.SOY,
  AllergenType.SULFITES,
  AllergenType.WHEAT,
]

const AccountUpdateBox: FC<AccountUpdateBoxProps> = <T = any>({
  t,
  label,
  defaultObject,
  onSave,
  cells,
}: AccountUpdateBoxProps<T>) => {
  const [state, setState] = useState<T>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setState(defaultObject)
  }, [defaultObject])

  const isChanged = useMemo(() => {
    if (!state) return false

    // Used to check if any of the values in the object have changed
    return JSON.stringify(state) !== JSON.stringify(defaultObject)
  }, [state, defaultObject])

  if (!state || loading) {
    return <CircularProgress />
  }

  return (
    <AccountBox label={label}>
      <Grid
        container
        sx={{
          columns: { xs: 1, md: 2 },
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {cells.map((cell) => {
          switch (cell.type) {
            case 'allergenes':
              return (
                <>
                  <Typography>{cell.label}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {allAllergenes.map((allergen) => {
                      const exists = (state[cell.field] as string[]).includes(
                        allergen,
                      )
                      return (
                        <Chip
                          key={allergen}
                          size="medium"
                          color={exists ? 'primary' : 'default'}
                          onClick={() => {
                            setState((prev) => {
                              // TODO: There has to be a better way to write this function.
                              if (!prev) {
                                return undefined
                              }

                              let tmpArray = prev[cell.field] as string[]

                              if (exists) {
                                tmpArray = tmpArray.filter(
                                  (prevAllergen) => prevAllergen !== allergen,
                                )
                              } else {
                                // For some reason it causes defaultObject to change when mutating the array directly (push)
                                tmpArray = [...tmpArray, allergen]
                              }

                              return {
                                ...prev,
                                [cell.field]: tmpArray,
                              }
                            })
                          }}
                          label={t(allergen.toLowerCase())}
                        />
                      )
                    })}
                  </Box>
                </>
              )
            default:
              return (
                <TextField
                  key={cell.field as string}
                  label={cell.label}
                  type={cell.type}
                  variant="outlined"
                  disabled={!onSave || cell.disabled} // Disable if there is no onSave function
                  value={state[cell.field]}
                  onChange={(event) => {
                    const value = event.target.value
                    const parsedValue =
                      cell.type === 'number' ? Number.parseInt(value) : value
                    setState((prev: any) => ({
                      ...prev,
                      [cell.field]: parsedValue,
                    }))
                  }}
                />
              )
          }
        })}
      </Grid>
      {onSave && (
        <Button
          disabled={!isChanged}
          sx={{ marginTop: 2 }}
          color="success"
          variant="contained"
          fullWidth
          onClick={async () => {
            setLoading(true)
            await onSave(state)
            setLoading(false)
          }}
        >
          {t('save')}
        </Button>
      )}
    </AccountBox>
  )
}

export default AccountUpdateBox
