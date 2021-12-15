import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { MessageProvider } from './View/Header/Message/Message'
import { AuthProvider } from './Contexts/AuthContext'

ReactDOM.render(
  <AuthProvider>
    <MessageProvider>
      <App />
    </MessageProvider>
  </AuthProvider>,
  document.getElementById('root'),
)
