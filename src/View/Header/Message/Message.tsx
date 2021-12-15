import React from 'react'

export enum MessageType {
  Success = 'success',
  Neutral = 'neutral',
  Error = 'error',
}

type ContextProps = {
  message: string
  type: MessageType
  setNewMessage: (message: string, type?: MessageType) => void
}

export const MessageContext = React.createContext<ContextProps>({
  type: MessageType.Neutral,
  message: '',
  setNewMessage: () => {},
})

export const MessageProvider: React.FC = ({ children }) => {
  const [message, setMessage] = React.useState<string>('')
  const [type, setType] = React.useState<MessageType>(MessageType.Neutral)

  const [listener, setListener] = React.useState<NodeJS.Timeout | undefined>()

  const setNewMessage = async (
    message: string,
    type: MessageType = MessageType.Neutral,
  ) => {
    setMessage(message)
    setType(type)
    if (listener) {
      clearTimeout(listener)
    }
    if (message !== '') {
      const timeout: any = setTimeout(() => {
        setMessage('')
        setType(MessageType.Neutral)
      }, 5000)
      setListener(timeout)
    }
  }

  return (
    <MessageContext.Provider
      value={{
        message,
        setNewMessage,
        type,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}
