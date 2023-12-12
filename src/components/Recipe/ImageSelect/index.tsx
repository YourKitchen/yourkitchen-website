import { Delete } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  TextField,
  Typography,
} from '@mui/material'
import { RecipeImage } from '@prisma/client'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { TFunction } from 'next-i18next'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { v4 } from 'uuid'

interface ImageSelectProps {
  t: TFunction
  value?: (RecipeImage & { file?: File })[]
  onChange: (images: (RecipeImage & { file?: File })[]) => void
  recipeId: string
}

const ImageSelect: FC<ImageSelectProps> = ({
  t,
  value,
  onChange,
  recipeId,
}) => {
  // Context
  const { data: session } = useSession()

  // States
  const [open, setOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const [files, setFiles] = useState<
    (RecipeImage & { link?: string; file?: File })[]
  >(value ?? [])
  const [currentFile, setCurrentFile] = useState<{
    id: string
    url?: string
    file?: File
  }>({
    id: v4(),
    url: '',
  })

  useEffect(() => {
    if (value) {
      setFiles(value)
    }
  }, [value])

  const downloadFile = async (value: string): Promise<File> => {
    const response = await axios.get(value, {
      responseType: 'arraybuffer',
    })

    return new File([Buffer.from(response.data, 'binary')], 'file.jpg')
  }

  const submitEdit = async () => {
    if (!session) {
      toast.error('Not logged in')
      return
    }
    // If currentFile is not defined, test the url
    let file: { id: string; file?: File } | null = currentFile ?? null
    try {
      if (!currentFile?.file && !currentFile?.url) {
        toast.error('No file defined')
        return
      }
      if (currentFile.url) {
        const image = await downloadFile(currentFile.url)
        file = {
          id: v4(),
          file: image,
        }
      }
    } catch (err) {
      toast.error(err.message ?? err)
      return
    }

    if (!file) {
      // Error will already have been shown.
      return
    }

    setFiles((prev) => {
      if (prev.some((image) => image.id === file?.id)) {
        // Edit
        return prev.map((image) =>
          image.id === file?.id
            ? { ...image, link: '', file: file?.file }
            : image,
        )
      }
      // Create
      prev.push({
        id: v4(),
        link: '', // If file is present, it will be preffered.
        photographer: session.user.name,
        photographerUrl: `https://yourkitchen.io/user/${session.user.id}`,
        recipeId,
        photoRefUrl: null,
        file: file?.file,
      })

      return prev
    })
    setAddOpen(false)
  }

  const submit = () => {
    onChange(files)

    setOpen(false)
  }

  return (
    <>
      <Button variant="contained" fullWidth onClick={() => setOpen(true)}>
        {t(files.length === 0 ? 'upload_image' : 'image_selected')}
      </Button>
      <Dialog fullWidth maxWidth="sm" open={open}>
        <DialogTitle>{t('images')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The following contains a list of the images linked to this recipe.
          </DialogContentText>
          {files && (
            <List>
              {files.map((image) => (
                <Box
                  key={image.id}
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    sx={{
                      flex: 1,
                      justifyContent: 'left',
                      color: (theme) => theme.palette.text.primary,
                    }}
                    onClick={() => {
                      // Start edit
                      setCurrentFile({
                        id: image.id,
                        url: image.link,
                      })
                      setAddOpen(true)
                    }}
                  >
                    {`${t('photography_by')} ${image.photographer}`}
                  </Button>
                  <IconButton
                    sx={{
                      width: '40px',
                      height: '40px',
                    }}
                    onClick={() => {
                      console.log(files, image.id)
                      setFiles((prev) =>
                        prev.filter((file) => file.id !== image.id),
                      )
                    }}
                  >
                    <Delete color="error" />
                  </IconButton>
                </Box>
              ))}
            </List>
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              // Make sure that it is undefined
              setCurrentFile({
                id: v4(),
                url: '',
              })
              setAddOpen(true)
            }}
          >
            {t('add_new_image')}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" color="success" onClick={submit}>
            {t('submit')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog fullWidth maxWidth="sm" open={addOpen}>
        <DialogTitle>{t('upload_image')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="url"
            value={currentFile?.url}
            placeholder={t('url')}
            onChange={(e) =>
              setCurrentFile((prev) => ({
                ...prev,
                url: e.target.value,
              }))
            }
          />
          <Typography textAlign={'center'} sx={{ my: 1 }}>
            {t('or')}
          </Typography>
          <Button fullWidth component="label">
            {t(!currentFile.file ? 'select_file' : 'image_selected')}
            <input
              accept="image/*"
              hidden
              onChange={(e) =>
                setCurrentFile((prev) =>
                  e.target.files && e.target.files.length > 0
                    ? { ...prev, file: e.target.files[0] }
                    : prev,
                )
              }
              type="file"
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
          <Button onClick={submitEdit} variant="contained" color="success">
            {t('submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ImageSelect
