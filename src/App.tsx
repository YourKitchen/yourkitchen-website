// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faApple,
  faFacebookF,
  faGoogle,
} from '@fortawesome/free-brands-svg-icons'
import {
  faCircle,
  faPlus,
  faPaperPlane,
  faColumns,
  faCopyright,
  faBroom,
  faUsers,
  faHome,
} from '@fortawesome/free-solid-svg-icons'
import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { MainRoutes } from './Routes'
import Footer from './View/Footer'
import Header from './View/Header/Header'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCjKz_BpHfmad58AFqehVCt6aSSuT6jJjg',
  authDomain: 'yourkitchen-6153b.firebaseapp.com',
  projectId: 'yourkitchen-6153b',
  storageBucket: 'yourkitchen-6153b.appspot.com',
  messagingSenderId: '873336034583',
  appId: '1:873336034583:web:dceb356ffedc0f38c85352',
}

library.add(
  faCircle,
  faPlus,
  faPaperPlane,
  faColumns,
  faCopyright,
  faBroom,
  faUsers,
  faHome,
  faGoogle,
  faApple,
  faFacebookF,
)

const App: React.FC = () => {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  getAnalytics(app)

  return (
    <BrowserRouter>
      <div className="App">
        <Header />

        <div className="main">
          <MainRoutes />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
