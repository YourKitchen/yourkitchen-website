import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import './index.css'
const Login = React.lazy(() => import('../Auth/Login'))
const ClaimRequestsPage = React.lazy(() => import('./ClaimRequest'))
const MainPage = React.lazy(() => import('./Main'))
const UsersPage = React.lazy(() => import('./User'))

const Loader = () => <p>Loading..</p>

export const Dashboard: React.FC = () => {
  const { user } = React.useContext(AuthContext)
  const navigate = useNavigate()

  if (!user) {
    return <Login />
  }
  if (user.role !== 'Admin') {
    navigate('/')
    return <></>
  }

  return (
    <div className="dashboard">
      <div className="sideMenu">
        <Link to={'/dashboard'}>
          <FontAwesomeIcon style={{ marginRight: 10 }} icon={['fas', 'home']} />
          Dashboard
        </Link>
        <Link to={'/dashboard/users'}>
          <FontAwesomeIcon
            style={{ marginRight: 10 }}
            icon={['fas', 'users']}
          />
          Users
        </Link>
        <Link to={'/dashboard/claimrequests'}>
          <FontAwesomeIcon
            style={{ marginRight: 10 }}
            icon={['fas', 'broom']}
          />
          Claim Requests
        </Link>
      </div>
      <div className="dashboardContainer">
        <React.Suspense fallback={<Loader />}>
          <Routes>
            <Route path={'/'} element={<MainPage />} />
            <Route path={'users'} element={<UsersPage />} />
            <Route path={'claimrequests'} element={<ClaimRequestsPage />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  )
}

export default Dashboard
