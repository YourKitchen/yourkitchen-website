import React from 'react'
import logo from '../../../Assets/images/Logo-512x512.png'
import AppStoreBadge from '../../../Assets/images/AppStoreBadge.svg'
import './MainPage.css'

const MainPage: React.FC = () => {
  document.title = 'YourKitchen'

  return (
    <div>
      <img className="logo" src={logo} alt="Logo" />
      <h1>YourKitchen</h1>
      <h2>Keep track of your kitchen</h2>
      <div
        style={{
          flexDirection: 'row',
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
        <a href="https://play.google.com/store/apps/details?id=com.unknownstudios.yourkitchen&hl=da&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
          <img
            style={{ height: 60 }}
            alt="Get it on Google Play"
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
          />
        </a>
        <a href="https://apps.apple.com/us/app/yourkitchen/id1587896995">
          <img
            style={{ height: 50, justifyContent: 'center' }}
            alt="Download app on App store"
            src={AppStoreBadge}
          />
        </a>
      </div>
    </div>
  )
}

export default MainPage
