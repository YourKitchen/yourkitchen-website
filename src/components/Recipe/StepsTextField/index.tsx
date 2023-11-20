import {
  Add,
  ArrowForward,
  ArrowRight,
  Create,
  Search,
} from '@mui/icons-material'
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  debounce,
} from '@mui/material'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { Ingredient, RecipeIngredient, Unit } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { TFunction } from 'next-i18next'
import React, {
  ChangeEventHandler,
  Dispatch,
  FC,
  SetStateAction,
  TextareaHTMLAttributes,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import { getIngredientId } from 'src/utils'
import useSWR from 'swr'
import { allUnits } from '#models/units'
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

    position: {
      start: number
      end: number
    }
  } | null>(null)

  // FullSearchDialog
  const [fullSearchValue, setFullSearchValue] = useState<string | null>(null)
  // CreateIngredientDialog
  const [createIngredientValue, setCreateIngredientValue] = useState<
    string | null
  >(null)
  // Select Ingredient
  const [selectedIngredient, setSelectedIngredient] = useState<Partial<
    Omit<RecipeIngredient, 'recipeId'>
  > | null>(null)

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

    updateCaretCoordinates(true)
  }

  const handleMouseDown = () => {
    updateCaretCoordinates(true)
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

  function createCopy(
    textArea: EventTarget & (HTMLInputElement | HTMLTextAreaElement),
  ) {
    const copy = document.createElement('div')
    copy.textContent = textArea.value
    const style = getComputedStyle(textArea)
    const keys = [
      'fontFamily',
      'fontSize',
      'fontWeight',
      'wordWrap',
      'whiteSpace',
      'borderLeftWidth',
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
    ]
    for (const key of keys) {
      const anyKey = key as any
      copy.style[anyKey] = style[anyKey]
    }
    copy.style.overflow = 'auto'
    copy.style.width = `${textArea.offsetWidth}px`
    copy.style.height = `${textArea.offsetHeight}px`
    copy.style.position = 'absolute'
    copy.style.left = `${textArea.offsetLeft}px`
    copy.style.top = `${textArea.offsetTop}px`
    document.body.appendChild(copy)
    return copy
  }

  function getCaretPosition() {
    const textArea = inputRef.current
    if (!textArea) {
      return
    }

    const start = textArea.selectionStart
    const end = textArea.selectionEnd
    const copy = createCopy(textArea)
    if (!copy.firstChild) {
      return
    }
    const range = document.createRange()
    range.setStart(copy.firstChild, start ?? 0)
    range.setEnd(copy.firstChild, end ?? 0)
    const selection = document.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    const rect = range.getBoundingClientRect()
    document.body.removeChild(copy)
    textArea.selectionStart = start
    textArea.selectionEnd = end
    textArea.focus()
    return {
      x: rect.left,
      y: rect.top + window.scrollY,
    }
  }

  const setValueDelayed = useMemo(() => debounce(setSearchValue, 250), [])

  const updateCaretCoordinates = (explicit?: boolean) => {
    // Need to add a timeout to allow the input ref to update first
    setTimeout(() => {
      const inputElement = inputRef.current

      if (!inputElement) {
        setSuggestionPosition(null)
        return
      }

      const { selectionEnd: cursorPosition } = inputElement

      if (!cursorPosition) {
        setSuggestionPosition(null)
        return
      }

      // Get all words
      const words = inputElement.value.split(/\s+/g)

      // Find the word located at the cursorPosition.
      let curPosition = 0
      let cursorWord: string | undefined
      let position:
        | {
            start: number
            end: number
          }
        | undefined = undefined
      for (const word of words) {
        // Add the word length
        curPosition += word.length

        if (cursorPosition <= curPosition) {
          position = {
            start: curPosition - word.length,
            end: curPosition + word.length,
          }
          cursorWord = word
          break
        }

        // Add the space
        curPosition += 1
      }

      if (!cursorWord || !cursorWord.startsWith('!') || !position) {
        setSuggestionPosition(null)
        return
      }

      // If the word ends with ! it is a finished ingredient.
      if (cursorWord.endsWith('!') && !explicit) {
        setSuggestionPosition(null)
        return
      }

      // Update the suggestions
      setValueDelayed(cursorWord.replaceAll('!', ''))

      // Set the position of the suggestion element
      const { x: left, y: top } = getCaretPosition() ?? { x: 0, y: 0 }

      setSuggestionPosition({
        top: top - 8, // Half chip height
        left: left + 6, // 6px offset

        cursorWord: cursorWord.replaceAll('!', ''),
        position,
      })
      setSelectedIngredient(null)
    }, 1)
  }

  const handleOpenFullSearchDialog = () => {
    setFullSearchValue(suggestionPosition?.cursorWord ?? '')
  }

  const submitSelectedIngredient = () => {
    if (!suggestionPosition) {
      toast.error('Position is not correctly marked')
      return
    }
    if (!selectedIngredient?.amount) {
      toast.error('An amount is required to add this string')
      return
    }
    if (!selectedIngredient.unit) {
      toast.error('A unit is required to add this string')
      return
    }
    if (!selectedIngredient.ingredientId) {
      toast.error('')
    }

    // Construct the ingredient string
    const ingredientString = `!${selectedIngredient.amount}:${selectedIngredient.unit}:${selectedIngredient.ingredientId}!`

    // Replace the new
    const formattedValue =
      value.substring(0, suggestionPosition.position.start) +
      ingredientString +
      value.substring(suggestionPosition.position.end)

    setValue(formattedValue)

    // Replace the position of the cursot to the new end position
    const updatedEndPosition =
      suggestionPosition.position.start + ingredientString.length

    inputRef.current?.setSelectionRange(updatedEndPosition, updatedEndPosition)
    setSelectedIngredient(null)
  }

  const onSearchValueSelected = (value: Ingredient) => {
    // When a search value is selected, show the dialog to select unit.
    setSelectedIngredient({
      amount: 0,
      ingredientId: getIngredientId(value.name),
      unit: 'GRAM',
    })
    setFullSearchValue(null)
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
        label={label || 'Step (Use ! to insert ingredient)'}
        multiline
        rows={4}
        variant="outlined"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
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
          {selectedIngredient ? (
            <Paper
              id="selected-ingredient-form"
              sx={{
                p: '2px 4px',
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                width: 325,
              }}
            >
              <Select
                size="small"
                sx={{ flex: 1 }}
                defaultValue={selectedIngredient.unit}
                onChange={(e) => {
                  setSelectedIngredient((prev) =>
                    prev ? { ...prev, unit: e.target.value as Unit } : null,
                  )
                }}
                MenuProps={{
                  sx: {
                    maxHeight: 300,
                  },
                }}
              >
                {allUnits.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
              <InputBase
                autoFocus
                placeholder={t('amount')}
                size="small"
                sx={{
                  flex: 1,
                  borderRadius: '20px',
                }}
                value={selectedIngredient.amount ?? 0.0}
                onChange={(e) =>
                  setSelectedIngredient((prev) =>
                    prev
                      ? {
                          ...prev,
                          amount:
                            (!Number.isNaN(Number(e.target.value))
                              ? Number(e.target.value)
                              : prev?.amount) ?? undefined,
                        }
                      : null,
                  )
                }
                type="number"
              />
              <IconButton color="primary" onClick={submitSelectedIngredient}>
                <ArrowForward />
              </IconButton>
            </Paper>
          ) : !suggestions || suggestions.data.length === 0 ? (
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
