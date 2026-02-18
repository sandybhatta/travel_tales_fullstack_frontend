import React from 'react'
import Logo from "../TravelTalesWhite.png"
import { Link } from 'react-router-dom'
import Search from './Search'


const NavComponent = ({isSearchOpen , setIsSearchOpen}) => {
  
  return (
    <nav className="w-full h-[80px] fixed bg-[#2b2d42] flex items-center justify-between px-4 md:px-8 shadow-lg z-30 backdrop-blur-sm bg-opacity-95">
    
      {/* Logo - Hidden on mobile, visible on medium screens and up */}
      <div className={`h-full items-center w-[120px] md:w-[200px] hidden md:flex`}>
        <Link to="/home" className="flex items-center h-full group">
          <img
            src={Logo}
            alt="Logo"
            className="object-contain h-[35px] md:h-[50px] group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
        </Link>
      </div>

      {/* Mobile Chat Icon - Visible only on mobile */}
      <div className="md:hidden flex items-center pr-2">
         <Link to="/chat" className="text-white hover:text-gray-300 transition-colors">
            <i className="bx bx-message-circle-detail text-3xl"></i>
         </Link>
      </div>

      {/* Search Input (visible on all screens) */}
      <div className="flex flex-1 justify-center max-w-[600px] px-2 lg:px-0">
        <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      </div>

      {/* Chat Icon */}
      <div className="w-[200px] hidden lg:flex justify-end items-center gap-4">
        <Link to="/chat" className="text-white hover:text-gray-300 transition-colors" title="Chats">
          <i className="bx bx-message-circle-detail text-3xl"></i>
        </Link>
      </div>

    </nav>
  );
}

export default NavComponent