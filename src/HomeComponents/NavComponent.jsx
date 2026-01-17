import React from 'react'
import Logo from "../TravelTalesWhite.png"
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Search from './Search'


const NavComponent = ({isSearchOpen , setIsSearchOpen}) => {
  
  const reduxUserState=useSelector(state=>state.user)

  // in case state is unavailable due to refresh
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  // redux states
  const reduxProfilePic = reduxUserState?.avatar
  const reduxUsername = reduxUserState?.username
  const reduxName = reduxUserState?.name
  const reduxId = reduxUserState._id

  // localStorage states
  const stateProfilePic = userInfo?.avatar
  const stateUsername = userInfo?.username
  const stateName = userInfo?.name
  const stateId = userInfo?._id

  const userId= reduxId || stateId
  const avatar = reduxProfilePic || stateProfilePic 
  const username =  reduxUsername  || stateUsername
  const name =  reduxName  || stateName


  return (
    <nav className="w-full h-[80px] fixed  bg-[#2b2d42] flex items-center justify-between px-4 md:px-8 shadow-md z-30" 
    
    >
      {/* Logo */}
      <div className="h-full flex items-center">
        <Link to="/home" className="flex items-center h-full">
          <img
            src={Logo}
            alt="Logo"
            className="object-contain h-[60px] hover:scale-105 transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Search Input (hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-[50%] justify-center">
        <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      </div>

      {/* Navigation Links (hidden on mobile/tablet) */}
      <Link to={`/profile/${userId}`}
      className='w-[20%]'>
          <div className="w-full hidden cursor-pointer lg:flex items-center text-[#EDF2F4] text-[1.1rem] relative ">
                <div
                  className="flex flex-row items-center gap-3 p-2 rounded-full  transition-all duration-400 relative bg-[#353749]"
                >
                  {/* Avatar */}
                  <img src={avatar} alt="User" className="w-14 h-14 object-cover rounded-full" />

                  {/* Username and Name */}
                  <div className="flex flex-col justify-center gap-1 text-[0.8rem]">
                    <p>@ {username}</p>
                    <p>{name}</p>
                  </div>

                  {/* Dropdown Icon */}
                  <i className='bx bx-chevron-down  text-[2rem] text-[#FFFFFF]'></i>
                </div>
          </div>
      </Link>

    </nav>
  );
}

export default NavComponent