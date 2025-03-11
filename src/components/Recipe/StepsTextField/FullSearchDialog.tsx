'use client'
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  debounce,
} from '@mui/material'
import type { Ingredient } from '@prisma/client'
import { useSession } from 'next-auth/react'
import React, { type FC, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import type { TFunction } from '#models/TFunction'
import type { YKResponse } from '#models/ykResponse'

interface FullSearchDialogProps {
  t: TFunction
  open: boolean
  handleClose: () => void
  defaultValue: string
  onChange: (ingredient: Ingredient) => void
  openCreateDialog: (value: string) => void
}

const FullSearchDialog: FC<FullSearchDialogProps> = ({
  t,
  open,
  handleClose,
  defaultValue,
  onChange,
  openCreateDialog,
}) => {
  const { data: session } = useSession()

  const [value, setValue] = useState<string>(defaultValue)
  const [searchValue, setSearchValue] = useState<string>()

  const { data: suggestions } = useSWR<YKResponse<Ingredient[]>>(
    searchValue ? { url: 'ingredient/search', searchTerm: searchValue } : null,
  )

  const setValueDelayed = useMemo(() => debounce(setSearchValue, 250), [])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('full_search')}</DialogTitle>
      <DialogContent>
        <Autocomplete
          fullWidth
          sx={{ my: 2 }}
          value={value}
          onInputChange={(_e, newValue) => {
            // Refresh suggestions
            setValueDelayed(newValue)

            // Set input field value
            setValue(newValue)
          }}
          onChange={(_e, newValue) => {
            const ingredient = suggestions?.data.find(
              (suggestion) => suggestion.name === newValue,
            )

            if (ingredient) {
              onChange(ingredient)
            }
          }}
          options={suggestions?.data.map((suggestion) => suggestion.name) ?? []}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField {...params} label={t('search')} />
          )}
          noOptionsText={
            <Button
              color="primary"
              fullWidth
              onClick={() => {
                // if (
                //   session?.user.role !== 'ADMIN' &&
                //   (session?.user.score ?? 0) < 5
                // ) {
                //   toast.error(`${t('need_score_of')} 5`)
                //   return
                // }
                openCreateDialog(value)
              }}
            >
              {t('add_new')}
            </Button>
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default FullSearchDialog
