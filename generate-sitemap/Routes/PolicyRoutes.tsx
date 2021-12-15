const React = require('react')
const { Route, Routes } = require('react-router')

export const PolicyRoutes = () => {
  return (
    <Routes>
      <Route path="cookies" />
      <Route path="privacy" />
      <Route path="terms" />
      <Route path="termsofuse" />
    </Routes>
  )
}

export default PolicyRoutes
