import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

// Importing API's
import Auth from '../services/Auth'

// importing styles
import '../styles/components.css'

// importing assests
import Logo from '../assets/logo.jpg'

function Header() {

  const { handleLogout } = Auth();

  const handleLogoutClick = () => {
    handleLogout();
    console.log('Logout Clicked');
  }

  return (
    <nav className="HeaderContainer">
      <div className='HeaderLeftContainer'>
        <img src={Logo} alt="Logo"/>
      </div>
      <div className='HeaderRightContainer'>
        <div className='HeaderUserDetails'>
          <span className='HeaderUserName'>John Doe</span>
          <Icon icon={"mynaui:user"} className="HeaderIcon" />
        </div>
        <Icon icon={"uil:exit"} className="HeaderIcon" onClick={handleLogoutClick}/>
      </div>
    </nav>
  )
}

export default Header