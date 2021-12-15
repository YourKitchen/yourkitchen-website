import React from 'react'
import { Route, Routes } from 'react-router'
const Login = React.lazy(() => import('../View/Auth/Login'))
const Signout = React.lazy(() => import('../View/Auth/Login/Signout'))
const Verify = React.lazy(() => import('../View/Auth/Verify'))
const Dashboard = React.lazy(() => import('../View/Dashboard'))
const ExplorePage = React.lazy(() => import('../View/Main/Explore/ExplorePage'))
const FeedPage = React.lazy(() => import('../View/Main/FeedPage'))
const MainPage = React.lazy(() => import('../View/Main/Main/MainPage'))
const AddRecipePage = React.lazy(
  () => import('../View/Main/Recipe/AddRecipePage/AddRecipePage'),
)
const RecipePage = React.lazy(() => import('../View/Main/Recipe/RecipePage'))
const PolicyRoutes = React.lazy(() => import('./PolicyRoutes'))

const Loader = () => <p>Loading..</p>

export const MainRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/signout" element={<Signout />} />
        <Route path="/recipe/add" element={<AddRecipePage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/policies/*" element={<PolicyRoutes />} />
      </Routes>
    </React.Suspense>
  )
}

export default MainRoutes
