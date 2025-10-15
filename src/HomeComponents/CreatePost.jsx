import React, { useState } from 'react'
import { useSelector } from 'react-redux'

const CreatePost = () => {
    const [activeTab, setActiveTab] =useState("post")
    const reduxProfilePic = useSelector(state=>state.user.avatar)
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const userProfilePic = userInfo.avatar;
  
    const avatar = reduxProfilePic || userProfilePic

    
  return (
    <div className='h-[200px] w-[700px] bg-[#EDF2F4] flex justify-between p-3 mt-10 rounded-lg'>
      
      {/* photo section */}
      <div className='w-[50px] h-full'>
            <img
            className='object-contain'
            src={avatar}
            alt='user profile pic'
            />
            <div>
               <button
               onClick={()=>setActiveTab("post")}
               >Create a Post</button>

               <button 
               onClick={()=>setActiveTab("trip")}
               >Create a Post</button>
            </div>
      </div>

      <div>

         


        <i className='bx  bx-image text-[#ffffff]' ></i> 
      <i class='bx  bx-video text-[#ffffff]' ></i> 
      <i class='bx  bx-trip text-[#ffffff]' ></i>     
      <i class='bx  bx-price-tag text-[#ffffff]'></i> 
      <i class='bx  bx-send text-[#ffffff]'></i>   
      </div>
      

    </div>
  )
}

export default CreatePost