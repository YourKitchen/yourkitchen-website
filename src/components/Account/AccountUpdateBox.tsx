import { Button, CircularProgress, Grid, TextField } from '@mui/material'
import { TFunction } from 'next-i18next'
import { FC, useEffect, useMemo, useState } from 'react'
import AccountBox from './AccountBox'

interface AccountCell<T = any> {
  field: keyof T
  label: string
  type?: string
  disabled?: boolean
}

interface AccountUpdateBoxProps<T = any> {
  t: TFunction
  label: string
  object: T
  onSave?: (object: T) => PromiseLike<void>
  cells: AccountCell<T>[]
}

const AccountUpdateBox: FC<AccountUpdateBoxProps> = ({
  t,
  label,
  object,
  onSave,
  cells,
}) => {
  const [state, setState] = useState(object)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setState(object)
  }, [object])

  const isChanged = useMemo(() => {
    if (!state) return false
    // Used to check if any of the values in the object have changed
    const changedValues = Object.values(state).filter((value, index) => {
      return object && value !== Object.values(object)[index]
    })
    // If any of the values have changed, return true
    return changedValues.length > 0
  }, [state, object])

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
        {cells.map((cell) => (
          <TextField
            key={cell.field as string}
            label={cell.label}
            type={cell.type}
            variant="outlined"
            disabled={!onSave || cell.disabled} // Disable if there is no onSave function
            value={state[cell.field]}
            onChange={(event) => {
              setState((prev: any) => ({
                ...prev,
                [cell.field]: event.target.value,
              }))
            }}
          />
        ))}
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
