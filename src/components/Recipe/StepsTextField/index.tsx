import { Add, Create, Search } from '@mui/icons-material'
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  debounce,
} from '@mui/material'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { Ingredient } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { TFunction } from 'next-i18next'
import React, {
  ChangeEventHandler,
  Dispatch,
  FC,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { YKResponse } from '#models/ykResponse'
import CreateIngredientDialog from './CreateIngredientDialog'
import FullSearchDialog from './FullSearchDialog'

interface StepsTextFieldProps {
  t: TFunction
  value: string
  setValue: (newValue: string) => void
  label?: string
}

const StepsTextField: FC<StepsTextFieldProps> = ({
  t,
  value,
  setValue,
  label,
}) => {
  // States
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number
    left: number

    cursorWord?: string
  } | null>(null)

  // FullSearchDialog
  const [fullSearchValue, setFullSearchValue] = useState<string | null>(null)
  // CreateIngredientDialog
  const [createIngredientValue, setCreateIngredientValue] = useState<
    string | null
  >(null)

  // Debounced search value used to search database for ingredients
  const [searchValue, setSearchValue] = useState<string>()

  // Load the suggestions
  const { data: suggestions } = useSWR<YKResponse<Ingredient[]>>(
    searchValue
      ? { url: 'ingredient/search', searchTerm: searchValue, count: 1 }
      : null,
  )

  // Reference to step textfield
  const inputRef = useRef<
    EventTarget & (HTMLInputElement | HTMLTextAreaElement)
  >(null)

  // Handle changes to the text
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const inputValue = event.target.value
    setValue(inputValue)

    updateCaretCoordinates()
  }

  const handleMouseMove = () => {
    updateCaretCoordinates()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown'
    ) {
      // Handle up, down, left and right arrow keys, update the suggestion position accordingly
      updateCaretCoordinates()
    }
  }

  const setValueDelayed = useMemo(() => debounce(setSearchValue, 250), [])

  const updateCaretCoordinates = () => {
    // Need to add a timeout to allow the input ref to update first
    setTimeout(() => {
      const inputElement = inputRef.current

      if (!inputElement) {
        setSuggestionPosition(null)
        return
      }

      const {
        offsetLeft,
        offsetTop,
        scrollTop,
        selectionEnd: cursorPosition,
      } = inputElement
      const style = getComputedStyle(inputElement)

      const fontSize = parseFloat(style.fontSize)
      const fontFamily = style.fontFamily
      const lineHeight = parseFloat(style.lineHeight)
      if (!cursorPosition) {
        setSuggestionPosition(null)
        return
      }

      // Get all words
      const words = inputElement.value.split(/\s+/g)

      // Find the word located at the cursorPosition.
      let curPosition = 0
      let cursorWord: string | undefined
      for (const word of words) {
        // Add the word length
        curPosition += word.length

        if (cursorPosition <= curPosition) {
          cursorWord = word
          break
        }

        // Add the space
        curPosition += 1
      }

      if (!cursorWord || !cursorWord.startsWith('!') || cursorWord === '!') {
        setSuggestionPosition(null)
        return
      }

      // Update the suggestions
      setValueDelayed(cursorWord.replaceAll('!', ''))

      // Set the position of the suggestion element

      // Split the text into lines
      const textBeforeCaret = inputElement.value.substring(0, cursorPosition)

      // Calculate the size of the text using a canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        return
      }
      context.font = `${fontSize}px ${fontFamily}`
      const currentLineIndex = textBeforeCaret.split('\n').length - 1
      const currentLineWidth = context.measureText(
        textBeforeCaret.split('\n')[currentLineIndex],
      ).width
      canvas.remove()

      setSuggestionPosition({
        top: offsetTop + currentLineIndex * lineHeight + scrollTop,
        left: offsetLeft + currentLineWidth + 6, // 6px offset

        cursorWord: cursorWord.replaceAll('!', ''),
      })
    }, 1)
  }

  const handleOpenFullSearchDialog = () => {
    setFullSearchValue(suggestionPosition?.cursorWord ?? '')
  }

  const onSearchValueSelected = (value: Ingredient) => {
    // When a search value is selected, show the dialog to select unit.
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      {fullSearchValue && (
        <FullSearchDialog
          t={t}
          open={fullSearchValue !== null}
          defaultValue={fullSearchValue}
          onChange={onSearchValueSelected}
          handleClose={() => setFullSearchValue(null)}
          openCreateDialog={(value) => {
            setCreateIngredientValue(value)
          }}
        />
      )}
      {createIngredientValue && (
        <CreateIngredientDialog
          t={t}
          defaultValue={createIngredientValue}
          open={createIngredientValue !== null}
          handleClose={(newIngredient) => {
            if (newIngredient) {
              onSearchValueSelected(newIngredient)
            }
            setCreateIngredientValue(null)
          }}
        />
      )}
      <TextField
        label={label || 'Step'}
        multiline
        rows={4}
        variant="outlined"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseMove}
        inputRef={inputRef}
        fullWidth
      />

      {suggestionPosition && (
        <Box
          style={{
            position: 'absolute',
            top: suggestionPosition.top,
            left: suggestionPosition.left,
          }}
        >
          {!suggestions || suggestions.data.length === 0 ? (
            <Chip
              sx={{
                backdropFilter: 'blur(8px)',
              }}
              key={'search'}
              label={t('search')}
              icon={
                <Tooltip title={t('full_search')}>
                  <Search />
                </Tooltip>
              }
              onClick={handleOpenFullSearchDialog}
            />
          ) : (
            <Chip
              sx={{
                backdropFilter: 'blur(8px)',
              }}
              key={suggestions.data[0].name}
              label={suggestions.data[0].name}
              onClick={() => onSearchValueSelected(suggestions.data[0])}
              deleteIcon={
                <Tooltip title={t('full_search')}>
                  <Search />
                </Tooltip>
              }
              onDelete={handleOpenFullSearchDialog}
            />
          )}
        </Box>
      )}
    </Box>
  )
}

export default StepsTextField
