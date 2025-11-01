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

  const dispatch = useDispatch()

const userState =useSelector(state=>state.user)
const isStateIncomplete = !userState.accessToken || !userState.username || !userState.email;


  useEffect(()=>{
    if (isStateIncomplete) {
      dispatch(loadUserFromStorage())
    }

  },[userState,dispatch])
  

  
  return (
    <div className=' w-full  border '
    onClick={()=>{
      setIsSearchOpen(false)
      setCreateModal(false)
    }}
    >
      <NavComponent isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}/>
      
      <div className="flex">
    {/* Sidebar */}
    <div className="fixed top-[80px] left-0 w-1/5 h-[calc(100vh-80px)] border-2 border-white flex flex-col items-center">
      <SideBar />
    </div>

    {/* Main content area */}
    <div className=" w-[60%]  h-auto absolute top-[80px] left-[50%] -translate-x-[50%] flex items-center justify-center  bg-[#8D99AE]/60">
      <Outlet />
    </div>

    {/* Optional right-side component */}
    <TripRelatedData />
  </div>
     
      
      </div>
  )
}

export default Home