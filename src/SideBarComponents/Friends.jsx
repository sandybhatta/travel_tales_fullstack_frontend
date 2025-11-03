import React, {  useEffect, useState } from 'react'
import Suggestions from './FriendSection/Suggestions'
import MyFollowings from './FriendSection/MyFollowings'
import MyFollowers from './FriendSection/MyFollowers'

const Friends = () => {
  
    const [activePage,setActivePage] = useState("suggestions")
  

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
        {activePage === "followings" && <MyFollowings /> }
        {activePage === "followers" && <MyFollowers /> }

        
        
    </div>
  )
}

export default Friends