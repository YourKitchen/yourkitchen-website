import React from 'react'
import { Route, Routes } from 'react-router-dom'
const CookiesPage = React.lazy(
  () => import('../View/Settings/Policies/CookiesPage'),
)
const PrivacyPage = React.lazy(
  () => import('../View/Settings/Policies/PrivacyPage'),
)
const TermsOfUsePage = React.lazy(
  () => import('../View/Settings/Policies/TermsOfUse'),
)
const TermsPage = React.lazy(
  () => import('../View/Settings/Policies/TermsPage'),
)

const Loader = () => <p>Loading..</p>

const PolicyRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        <Route path="cookies" element={<CookiesPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="termsofuse" element={<TermsOfUsePage />} />
      </Routes>
    </React.Suspense>
  )
}

export default PolicyRoutes
