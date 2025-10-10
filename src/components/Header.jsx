import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// Importing Component
import DetailsPopOver from '../hooks/DetailsPopOver'

// Importing API's
import Auth from '../services/Auth'

// importing styles
import '../styles/components.css'

// importing assests
import Logo from '../assets/logo.jpg'

function Header() {

  const navigate = useNavigate();

  const { handleLogout } = Auth();
  const userDetails = useSelector((state) => state.auth.userDetails);

  const handleLogoutClick = () => {
    handleLogout();
  };

  return (
    <nav className="HeaderContainer">
      <div className='HeaderLeftContainer'>
        <img src={Logo} alt="Logo"/>
      </div>
      <div className='HeaderRightContainer'>
        <div className='HeaderUserDetails'>
          <DetailsPopOver DetailsContent={userDetails} />
          <span className='HeaderUserName'>{userDetails?.userName}</span>
        </div>
        <Icon icon={"eos-icons:admin-outlined"} className="HeaderIcon" onClick={() => navigate("/admin")}/>
        <Icon icon={"uil:exit"} className="HeaderIcon" onClick={handleLogoutClick}/>
      </div>
    </nav>
  )
}

export default Header
