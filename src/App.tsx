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
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { MainRoutes } from './Routes'
import Footer from './View/Footer'
import Header from './View/Header/Header'
import { initGA } from 'green-analytics-react'
import { initializeApp } from '@firebase/app'

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

initGA('aab4595a-ab94-4c99-b444-bfb5abc5adb1')

const App: React.FC = () => {
  // Initialize Firebase
  initializeApp(firebaseConfig)

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
