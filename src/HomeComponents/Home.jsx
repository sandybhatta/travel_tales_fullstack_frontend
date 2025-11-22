import React, { useEffect, useState } from 'react'
import NavComponent from './NavComponent'
import { useSelector,useDispatch } from 'react-redux'
import {loadUserFromStorage} from '../slices/userSlice'
import HomeFeed from './HomeFeed'
import SideBar from './SideBar'
import TripRelatedData from './TripRelatedData'
import { Outlet } from 'react-router-dom'





const Home = () => {
const [isSearchOpen,setIsSearchOpen] =useState(false)
const [isSidebarOpen,setIsSidebarOpen] =useState(false)

  const dispatch = useDispatch()

const userState =useSelector(state=>state.user)
const isStateIncomplete = !userState.accessToken || !userState.username || !userState.email;


  useEffect(()=>{
    if (isStateIncomplete) {
      dispatch(loadUserFromStorage())
    }

  },[userState,dispatch])
  

  
  return (
    <div className=' w-full  border'
    onClick={()=>{
      setIsSearchOpen(false)
      
    }}
    >
      <NavComponent isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}/>
      
      <div className="flex">
    {/* Sidebar */}
    <div className="fixed top-[80px] left-0 w-1/5 h-[calc(100vh-80px)] border-2 border-white flex flex-col items-center ">
      
        <i className='bx bx-sidebar text-black px-2 py-3 text-5xl absolute left-2 top-2'
        onClick={()=>setIsSidebarOpen(prev=>!prev)}
        ></i>
     {
      isSidebarOpen && <SideBar setIsSidebarOpen={setIsSidebarOpen} />
     }
      
    </div>

    {/* Main content area */}
    <div className= {` ${isSidebarOpen ? "w-4/5":"w-[calc(100%-100px)] "}  h-auto absolute top-[80px] right-0 flex items-center justify-center  bg-[#8D99AE]/60`}>
      <Outlet />
    </div>

    {/* Optional right-side component */}
    {/* <TripRelatedData /> */}
  </div>
     
      
      </div>
  )
}

export default Home