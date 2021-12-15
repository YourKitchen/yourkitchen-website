const React = require('react')
const { Route, Routes } = require('react-router')

export const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" />
      <Route path="/feed" />
      <Route path="/explore" />
      <Route path="/login" />
      <Route path="/verify" />
      <Route path="/signout" />
      <Route path="/recipe/add" />
      <Route path="/recipe/:id" />
      <Route path="/dashboard/*" />
      <Route path="/policies/*" />
    </Routes>
  )
}

export default MainRoutes
