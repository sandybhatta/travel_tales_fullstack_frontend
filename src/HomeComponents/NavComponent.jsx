import React from 'react'
import Logo from "../TravelTalesWhite.png"
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Search from './Search'


const NavComponent = () => {
  const[ searchParams, setSearchParms] = useSearchParams()
  const reduxProfilePic=useSelector(state=>state.user.avatar)
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  const stateProfilePic=userInfo?.avatar
  const avatar = reduxProfilePic || stateProfilePic || Logo
  return (
    <div className='w-full h-25 bg-[#2B2D42] flex items-center justify-between'>
        {/* Logo */}

        
        <div className='h-[100%] w-[10%] mx-2 '>
            <Link to="/home"
              className='  h-full w-full bg-rose-500 '>
                  <img
                  className='object-contain h-full'
                  src={Logo}
                  />
           
          </Link>
        </div>    
        

       

        {/* search input */}
        
          <Search/>

        

        {/* Expore trips create profile buttons */}
        <div className='text-white text-[1.25rem] flex items-center justify-around  h-full' >
          <Link className='block px-4 py-2 border-white/40 border-2 rounded-lg  hover:border-white transition-border duration-200 ease-in'>Home</Link>
          <Link className='block px-4 py-2 border-white/40 border-2 rounded-lg  hover:border-white transition-border duration-200 ease-in'>Explore</Link>
          <Link className='block px-4 py-2 border-white/40 border-2 rounded-lg  hover:border-white transition-border duration-200 ease-in'>Trips</Link>
          <Link className='block px-4 py-2 border-white/40 border-2 rounded-lg  hover:border-white transition-border duration-200 ease-in'>Bookmarks</Link>

          <Link className='block  border-white/40 border-2 rounded-lg  hover:border-white transition-border duration-200 ease-in  h-[100px] w-[100px] bg-red-900'>
          <img
          src={avatar}
          className='w-full h-full'
          />
          </Link>

        </div>


    {/* avatar*/}
        <div>

        </div>
    </div>
  )
}

export default NavComponent