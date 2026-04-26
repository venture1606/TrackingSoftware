import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

// Importing Component
import DetailsPopOver from '../hooks/DetailsPopOver'
import ConfirmDialog from './ConfirmDialog'
import ChangePasswordModal from './ChangePasswordModal'

// Importing API's
import Auth from '../services/Auth'

import usePermissions from '../services/permissions'

// importing styles
import '../styles/components.css'

// importing assests
import Logo from '../assets/logo.jpg'

function Header() {

  const navigate = useNavigate();

  const { handleLogout } = Auth();
  const userDetails = useSelector((state) => state.auth.userDetails);
  const { isAdmin } = usePermissions();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
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
          <span className='HeaderUserName'>{userDetails?.name}</span>
        </div>
        {isAdmin && <Icon icon={"eos-icons:admin-outlined"} className="HeaderIcon" onClick={() => navigate("/admin")}/>}
        <Icon icon={"material-symbols:lock-reset"} className="HeaderIcon" onClick={() => setIsPasswordModalOpen(true)}/>
        <Icon icon={"uil:exit"} className="HeaderIcon" onClick={handleLogoutClick}/>
      </div>

      <ConfirmDialog 
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Logout"
        colorScheme="red"
      />

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </nav>
  )
}

export default Header
