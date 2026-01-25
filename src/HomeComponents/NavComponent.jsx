import React from 'react'
import Logo from "../TravelTalesWhite.png"
import { Link } from 'react-router-dom'
import Search from './Search'


const NavComponent = ({isSearchOpen , setIsSearchOpen}) => {
  
  return (
    <nav className="w-full h-[80px] fixed bg-[#2b2d42] flex items-center justify-between px-4 md:px-8 shadow-lg z-30 backdrop-blur-sm bg-opacity-95">
    
      {/* Logo */}
      <div className="h-full flex items-center w-[120px] md:w-[200px]">
        <Link to="/home" className="flex items-center h-full group">
          <img
            src={Logo}
            alt="Logo"
            className="object-contain h-[35px] md:h-[50px] group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
        </Link>
      </div>

      {/* Search Input (visible on all screens) */}
      <div className="flex flex-1 justify-center max-w-[600px] px-2 lg:px-0">
        <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      </div>

      {/* Placeholder for balance (optional, or can be used for notifications later) */}
      <div className="w-[200px] hidden lg:flex justify-end">
         {/* Potential Notification Bell or other icons could go here */}
      </div>

    </nav>
  );
}

export default NavComponent