import React, {  useEffect, useState } from 'react'

import { useSelector } from 'react-redux'

import Suggestions from './FriendSection/Suggestions'

const Friends = () => {
  
    const [activePage,setActivePage] = useState("suggestions")
    const reduxUserId = useSelector(state=>state.user._id);
    const storageUser = JSON.parse(localStorage.getItem("userInfo"))
    const storageUserId = storageUser._id;
    const userId = reduxUserId || storageUserId 

    

   


  return (
    <div className='w-full h-auto relative '>
        <div
        className='w-full h-auto bg-[#8d99ae] flex justify-around items-center text-white text-2xl py-2'>
                <div
                onClick={()=>{setActivePage("suggestions")}}
                className={`${activePage==="suggestions" ? "bg-[#D90429]" : "bg-transparent"} cursor-pointer py-2 px-5 rounded-lg border-white border-1 text-center hover:bg-[#2B2D42] transition-all duration-200 ease-in `}
                >
                    <p>Suggestions</p>
                </div>

                <div
                onClick={()=>{setActivePage("followings")}}
                className={`${activePage==="followings" ? "bg-[#D90429]" : "bg-transparent"} cursor-pointer py-2 px-5 rounded-lg border-white border-1 text-center hover:bg-[#2B2D42] transition-all duration-200 ease-in `}
                >
                    <p>My Followings</p>
                </div>


                <div
                onClick={()=>{setActivePage("followers")}}
                className={`${activePage==="followers" ? "bg-[#D90429]" : "bg-transparent"} cursor-pointer py-2 px-5 rounded-lg border-white border-1 text-center hover:bg-[#2B2D42] transition-all duration-200 ease-in `}
                >
                    <p>My Followers</p>     
                </div>
        </div>

        {activePage === "suggestions" && <Suggestions /> }

        
        
    </div>
  )
}

export default Friends