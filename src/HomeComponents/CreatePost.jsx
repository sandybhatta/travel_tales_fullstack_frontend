import React, { useState } from 'react'
import { useSelector } from 'react-redux'

const CreatePost = () => {
    const reduxAvatar = useSelector(state=>state.user.avatar)
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const userAvatar=userInfo.avatar;
    const avatar = reduxAvatar || userAvatar;

    const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-[50%] bg-[#EDF2F4] rounded-xl shadow-lg  p-4 sm:p-6  flex items-center justify-center  gap-4 transition-all duration-300 hover:shadow-xl border-2">
        {}
      
      <div className=" w-[50%] h-[100px] bg-green-400 flex justify-between">
        <img
          src={avatar}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="">
          share your travel journey
        </div>
      </div>

      
    </div>
  );
}

export default CreatePost 
//   <i className='bx  bx-image text-[#ffffff]' ></i> 
//       <i class='bx  bx-video text-[#ffffff]' ></i> 
//       <i class='bx  bx-trip text-[#ffffff]' ></i>     
//       <i class='bx  bx-price-tag text-[#ffffff]'></i> 
//       <i class='bx  bx-send text-[#ffffff]'></i>   