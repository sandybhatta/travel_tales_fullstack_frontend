import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../TravelTalesWhite.png";

const Navbar = ({onFeatureClick , onAboutClick}) => {
  const [isOpen, setIsOpen] = useState(false);
  


  return (
    <nav
      className={"fixed w-full top-0 z-300 transition-all duration-300  bg-[#2B2D42]/90 backdrop-blur-md shadow-md" }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex justify-between items-center h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          
          <img src={logo} alt="TravelTales" className="h-20 w-auto " />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10 text-[1.05rem] font-medium">
          <Link
            to="#features"
            className="text-[#edf2f4] hover:text-[#ef233c] transition-colors duration-200"
            onClick={()=>onFeatureClick()}
          >
            Features
          </Link>
          <Link
            to="#about"
            className="text-[#edf2f4] hover:text-[#ef233c] transition-colors duration-200"
            onClick={onAboutClick}
          >
            About
          </Link>
          <Link
            to="/login"
            className="text-[#edf2f4] hover:text-[#ef233c] transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            to="/register-user"
            className="px-5 py-2 bg-[#ef233c] hover:bg-[#d90429] text-[#edf2f4] rounded-xl shadow-md transition-all duration-200"
          >
            Register
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-between w-7 h-6 focus:outline-none"
          >
            <span
              className={`h-1 w-full rounded bg-[#edf2f4] transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-2.5" : ""
              }`}
            ></span>
            <span
              className={`h-1 w-full rounded bg-[#edf2f4] transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`h-1 w-full rounded bg-[#edf2f4] transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-2.5" : ""
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden bg-[#2B2D42] text-[#edf2f4] flex flex-col items-center gap-4 py-6 transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <Link
          to="#features"
          onClick={() => {setIsOpen(false);
                         onFeatureClick()
          }}
          className="hover:text-[#ef233c] text-lg"
        >
          Features
        </Link>
        <Link
          to="#about"
          onClick={() => {
            setIsOpen(false);
            onAboutClick()
          }}
          className="hover:text-[#ef233c] text-lg"
        >
          About
        </Link>
        <Link
          to="/login"
          onClick={() => setIsOpen(false)}
          className="hover:text-[#ef233c] text-lg"
        >
          Sign In
        </Link>
        <Link
          to="/register-user"
          onClick={() => setIsOpen(false)}
          className="bg-[#ef233c] hover:bg-[#d90429] text-[#edf2f4] px-6 py-2 rounded-xl text-lg transition-all"
        >
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
