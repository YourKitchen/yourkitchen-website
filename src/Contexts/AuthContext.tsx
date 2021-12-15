import { FacebookLoginClient } from '@greatsumini/react-facebook-login'
import {
  auth,
  updateOne,
  userCreateOne,
  userDeleteOwn,
  userOwn,
} from '@yourkitchen/common'
import { User } from '@yourkitchen/models'
import React from 'react'

type ContextProps = {
  user?: User
  authenticated: boolean
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>
  loadingAuthState: boolean
  refreshUser: () => void
  logout: () => void
  deleteUser: () => void
  missingInfo: boolean
  setMissingInfo: React.Dispatch<React.SetStateAction<boolean>>
}

export const AuthContext = React.createContext<ContextProps>({
  user: undefined,
  authenticated: false,
  loadingAuthState: false,
  setUser: () => {},
  refreshUser: () => {},
  logout: () => {},
  missingInfo: false,
  setMissingInfo: () => {},
  deleteUser: () => {},
})

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = React.useState<User>()
  const [initialUser, setInitialUser] = React.useState<User>()
  const [loadingAuthState, setLoadingAuthState] = React.useState(true)
  const [missingInfo, setMissingInfo] = React.useState(false)

  const logout = async () => {
    try {
      FacebookLoginClient.logout(async () => {
        const logoutResponse = await auth.post('/logout')
        if (logoutResponse.data.ok === 1) {
          setMissingInfo(false)
          setUser(undefined)
        } else {
          console.error(logoutResponse.data.message)
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  const refreshUser = async () => {
    try {
      setLoadingAuthState(true)
      console.log('Refreshing user')
      const response = await auth.post('/me')
      const data = await response.data
      if (data && data.user) {
        if (!data.user.name) {
          // This will happen if no info has been provided.
          setMissingInfo(true)
          return
        } else {
          setMissingInfo(false) // If it was just updated (To update view)
        }
        console.log('Getting user')
        const userOwnResponse = await userOwn()
        if (userOwnResponse) {
          // Already exists
          setInitialUser(userOwnResponse)
          if (
            userOwnResponse.name !== data.user.name ||
            userOwnResponse.image !== data.user.image
          ) {
            setLoadingAuthState(false)
            return setUser({
              ...userOwnResponse,
              name: data.user.name,
              image: data.user.image,
            })
          }
          setLoadingAuthState(false)
          return setInitialUser(userOwnResponse)
        }

        // Create user
        console.log('Creating user')
        data.user.ID = data.user._id
        delete data.user.__v
        delete data.user._id
        delete data.user.created_at
        delete data.user.createdAt

        data.user.timezone = new Date().getTimezoneOffset() / 60

        console.log(data.user)

        const createUserResponse = await userCreateOne(data.user)
        if (createUserResponse && createUserResponse.record) {
          setInitialUser(createUserResponse.record)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAuthState(false)
    }
  }

  React.useEffect(() => {
    console.log('Authenticated changed:', !!initialUser)
    setUser(initialUser)
  }, [initialUser])

  React.useEffect(() => {
    refreshUser()
  }, [])

  const same = (a: User, b: User) => {
    return (
      a.name === b.name &&
      a.image === b.image &&
      a.allergenes === b.allergenes &&
      a.defaultPersons === b.defaultPersons &&
      a.following === b.following &&
      a.image === b.image &&
      a.notificationSettings === b.notificationSettings &&
      a.privacySettings === b.privacySettings
    )
  }

  React.useEffect(() => {
    ;(async () => {
      if (user && initialUser && !same(user, initialUser)) {
        console.log('Updating user')
        const tmpUser: Partial<User> = {
          allergenes: user.allergenes,
          defaultPersons: user.defaultPersons,
          name: user.name,
          notificationSettings: user.notificationSettings,
          privacySettings: user.privacySettings,
          tokens: user.tokens,
          image: user.image,
          timezone: user.timezone,
        }

        const updateResponse = await updateOne<User>('user', tmpUser, [
          'ID',
          'allergenes',
          'defaultPersons',
          'name',
          'email',
          'following',
          'image',
          { privacySettings: ['mealplan', 'consent', 'adConsent'] },
          { notificationSettings: ['mealplanFrequency'] },
          'score',
          'timezone',
        ])
        updateResponse.record && setInitialUser(updateResponse.record)
      }
    })()
  }, [user])

  const deleteUser = async () => {
    try {
      const response = await userDeleteOwn()
      if (response.ok === 1) {
        setUser(undefined)
      } else {
        console.error(response.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated: !!user,
        setUser,
        loadingAuthState,
        refreshUser,
        logout,
        missingInfo,
        setMissingInfo,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
