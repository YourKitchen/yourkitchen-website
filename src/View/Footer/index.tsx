import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Footer.css'

const Footer: React.FC = () => {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const hideNav = params.get('hideNav')

  if (hideNav) {
    return <></>
  }
  return (
    <div className="footer">
      <div>
        <Link to="/policies/terms">Terms and Conditions</Link>
        <Link to="/policies/privacy">Privacy Policy</Link>
        <Link to="/policies/cookies">Cookie Policy</Link>
      </div>
      <a
        style={{ display: 'block', marginTop: '20px' }}
        href="https://unknown-studios.com"
      >
        Copyright
        <FontAwesomeIcon icon="copyright" /> | Unknown-Studios
      </a>
    </div>
  )
}

export default Footer
