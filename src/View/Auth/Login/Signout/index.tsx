import React from 'react'
import { auth } from '@yourkitchen/common'
import { AuthContext } from '../../../../Contexts/AuthContext'
import { useNavigate } from 'react-router'

const Signout: React.FC = () => {
  const navigate = useNavigate()
  const { setUser } = React.useContext(AuthContext)

  React.useEffect(() => {
    auth.post('/logout').then(() => {
      setUser(undefined)
      navigate('/')
    })
  }, [])

  return <div>Logging out...</div>
}

export default Signout
