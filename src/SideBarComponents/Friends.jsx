import React, {  useEffect, useState } from 'react'
import Suggestions from './FriendSection/Suggestions'
import MyFollowings from './FriendSection/MyFollowings'
import MyFollowers from './FriendSection/MyFollowers'

const Friends = () => {
  
    const [activePage,setActivePage] = useState("suggestions")
  

  return (
    <div className='w-full min-h-screen bg-gray-900 text-white font-sans'>
        <div className='sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'>
            <div className='flex justify-center items-center max-w-4xl mx-auto'>
                <div className='flex w-full md:w-auto p-2 gap-2 md:gap-4 overflow-x-auto no-scrollbar'>
                    <button
                        onClick={() => setActivePage("suggestions")}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                            activePage === "suggestions"
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 transform scale-105"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                    >
                        Suggestions
                    </button>

                    <button
                        onClick={() => setActivePage("followings")}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                            activePage === "followings"
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 transform scale-105"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                    >
                        Following
                    </button>

                    <button
                        onClick={() => setActivePage("followers")}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                            activePage === "followers"
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 transform scale-105"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                    >
                        Followers
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 min-h-[calc(100vh-80px)]">
            <div className="transition-opacity duration-500 ease-in-out">
                {activePage === "suggestions" && <Suggestions />}
                {activePage === "followings" && <MyFollowings />}
                {activePage === "followers" && <MyFollowers />}
            </div>
        </div>
    </div>
  )
}

export default Friends