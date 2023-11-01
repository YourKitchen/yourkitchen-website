import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { debounce } from '@mui/material/utils'
import { Cuisine } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { TFunction } from 'next-i18next'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { YKResponse } from '#models/ykResponse'
import { api } from '#network/index'

interface CuisineAutocompleteProps {
  t: TFunction
  defaultCuisine: Cuisine['name']
  onChange: (cuisine: Cuisine | undefined) => void
}

const CuisineAutocomplete: FC<CuisineAutocompleteProps> = ({
  t,
  defaultCuisine,
  onChange,
}) => {
  // Auth
  const { data: session } = useSession()

  // States
  const [value, setValue] = useState(defaultCuisine)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [createName, setCreateName] = useState('')

  // Data
  const { data, isValidating: cuisineLoading } = useSWR<YKResponse<Cuisine[]>>(
    value.length > 2 ? { url: 'cuisine/search', searchTerm: value } : null,
  )

  const setValueDelayed = useMemo(() => debounce(setValue, 250), [])

  // Create Dialog
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false)
    setCreateName('')
  }

  const handleCreate = () => {
    toast.promise(
      api.post<Cuisine>('database/cuisine', {
        name: createName,
      }),
      {
        loading: `${t('creating')} ${t('cuisine')}`,
        error: (err) => err.message || err,
        success: (response) => {
          const cuisine = response.data

          // Set the cuisine as selected and close everything
          onChange(cuisine)
          handleCloseCreateDialog()

          return `${t('succesfully')} ${t('created')} ${t('cuisine')}`
        },
      },
    )
  }

  return (
    <>
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>{t('create_cuisine')}</DialogTitle>
        <DialogContent>
          <TextField
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder={t('name')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>{t('cancel')}</Button>
          <Button color="success" variant="contained" onClick={handleCreate}>
            {t('submit')}
          </Button>
        </DialogActions>
      </Dialog>
      <Autocomplete
        fullWidth
        value={value}
        onInputChange={(_e, newValue) => setValueDelayed(newValue)}
        loading={cuisineLoading}
        onChange={(_e, newValue) => {
          const cuisine = data?.data.find(
            (cuisine) => cuisine.name === newValue,
          )
          onChange(cuisine)
        }}
        options={data?.data.map((cuisine) => cuisine.name) ?? []}
        renderInput={(params: AutocompleteRenderInputParams) => (
          <TextField {...params} label={t('cuisine')} />
        )}
        noOptionsText={
          <Button
            color="primary"
            fullWidth
            onClick={() => {
              if (
                session?.user.role !== 'ADMIN' &&
                (session?.user.score ?? 0) < 25
              ) {
                toast.error(`${t('need_score_of')} 25`)
                return
              }
              setOpenCreateDialog(true)
            }}
          >
            {t('add_new')}
          </Button>
        }
      />
    </>
  )
}

export default CuisineAutocomplete
