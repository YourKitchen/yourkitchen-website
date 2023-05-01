import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import './Header.css'
import { MessageContext, MessageType } from './Message/Message'
import FileInput from '../Main/Recipe/AddRecipePage/Helpers/FileInput'
import { api, auth } from '@yourkitchen/common'
import PrivacyPage from '../Settings/Policies/PrivacyPage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { Box } from '@mui/material'
import Logo from '../../Assets/images/Logo.png'

const Header: React.FC = () => {
  // Data
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const hideNav = params.get('hideNav')
  const authContext = useContext(AuthContext)
  const messageContext = useContext(MessageContext)

  // States
  const [name, setName] = React.useState('')
  const [image, setImage] = React.useState<File>()
  const [preview, setPreview] = React.useState<string>()

  React.useEffect(() => {
    if (!image) {
      setPreview(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(image)
    setPreview(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [image])

  if (hideNav) {
    return <></>
  }

  const handleClose = () => {
    authContext.logout()
  }

  const submit = async () => {
    if (name && image) {
      const formData = new FormData()
      formData.append('file', image)
      const uploadImageData = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const imageName = uploadImageData.data.filename || ''
      await auth.post('/updateMe', {
        name,
        image: imageName,
      })
      authContext.refreshUser()
    }
  }

  const disagree = () => {
    authContext.deleteUser()
    messageContext.setNewMessage(
      'User successfully deleted',
      MessageType.Success,
    )
  }

  const agree = () => {
    authContext.setUser((prev) =>
      prev
        ? {
            ...prev,
            privacySettings: { consent: true },
          }
        : prev,
    )
  }

  return (
    <>
      <Box className="header" sx={{ display: 'flex', lineHeight: '75px' }}>
        <Button href="/">
          <img
            width={50}
            height={50}
            style={{ margin: 25 / 2.0, borderRadius: '50vh' }}
            alt="Company logo"
            src={Logo}
          />
        </Button>
        <Box
          className="loginWrapper"
          sx={{ display: 'flex', flexDirection: 'row' }}
        >
          <Box sx={{ display: 'flex', gap: 2, marginRight: 4 }}>
            <Button sx={{ color: '#fff' }} href="/">
              Home
            </Button>
            <Button sx={{ color: '#fff' }} href="/explore">
              Explore
            </Button>
          </Box>
          {authContext.user?.role === 'Admin' && (
            <Link
              aria-label="Dashboard Button"
              className="headerIconButton"
              to="/dashboard"
            >
              <FontAwesomeIcon icon={solid('columns')} />
            </Link>
          )}
          {authContext.authenticated && (
            <Link
              aria-label="Add recipe button"
              className="headerIconButton"
              to="/recipe/add"
            >
              <FontAwesomeIcon icon={solid('plus')} />
            </Link>
          )}
          {authContext.user && (
            <Link className="loginButton" to={`/user/${authContext.user.ID}`}>
              <img alt="User profilepicture" src={authContext.user.image} />
            </Link>
          )}
          <Link
            className="loginButton"
            to={authContext.authenticated ? '/signout' : '/login'}
          >
            {authContext.authenticated ? (
              <div>
                <FontAwesomeIcon
                  style={{ marginRight: 10 }}
                  icon={solid('right-from-bracket')}
                />
                Sign out
              </div>
            ) : (
              <div>
                <FontAwesomeIcon
                  style={{ marginRight: 10 }}
                  icon={solid('lock-open')}
                />
                Login
              </div>
            )}
          </Link>
        </Box>
      </Box>
      <div style={{ height: 50 }}>
        <div
          style={{ zIndex: 100 }}
          className={`message ${messageContext.type}`}
        >
          <p>{messageContext.message}</p>
        </div>
      </div>

      <Dialog open={authContext.missingInfo} onClose={handleClose}>
        <DialogTitle>Missing Info</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account has some missing information. Please provide it below
            to continue.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
            }}
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
          />
          <FileInput value={image} onChange={setImage} accept="image/*" />
          {preview && <img alt="Preview" className="preview" src={preview} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={submit}>Submit</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={
          !!authContext.user && // If user exists (Because this means that they are logged in)
          (authContext.user.privacySettings === undefined || // If privacySettings.consent is not defined or false
            !authContext.user?.privacySettings.consent)
        }
        onClose={handleClose}
      >
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <PrivacyPage />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={disagree}>Disagree</Button>
          <Button onClick={agree}>Agree</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Header
