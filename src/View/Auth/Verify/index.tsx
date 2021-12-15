import { auth } from '@yourkitchen/common'
import React from 'react'
import { useNavigate } from 'react-router'
import { MessageContext, MessageType } from '../../Header/Message/Message'

export const Verify: React.FC = () => {
  const search = window.location.search
  const params = new URLSearchParams(search)
  const token = params.get('token')
  const uid = params.get('uid')
  const navigate = useNavigate()
  const { setNewMessage } = React.useContext(MessageContext)

  React.useEffect(() => {
    if (!token) {
      setNewMessage('No token provided', MessageType.Error)
    } else if (!uid) {
      setNewMessage('No uid provided', MessageType.Error)
    } else {
      ;(async () => {
        try {
          const response = await auth.post(
            '/verify',
            {
              token,
              uid,
            },
            {
              validateStatus: () => true,
            },
          )
          const res = response.data
          if (res.ok === 1) {
            setNewMessage('Login successful', MessageType.Success)
            navigate('/')
          } else {
            setNewMessage(res.message, MessageType.Error)
          }
        } catch (err) {
          const error = err as any
          setNewMessage(error.message, MessageType.Error)
        }
      })()
    }
  }, [])

  return <div></div>
}

export default Verify
