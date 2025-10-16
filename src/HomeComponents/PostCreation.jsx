import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const PostCreation = ({setCreationTab}) => {
    const[caption,setCaption]=useState("")
    const[tagOpen,setTagOpen] = useState(false);
    const[visibilityOpen, setVisibilityOpen]=useState(false)
    const reduxUserState = useSelector(state=>state.user)
    const storageUserState = JSON.parse(localStorage.getItem("userInfo"))
    const avatar =reduxUserState.avatar || storageUserState.avatar
    const name =reduxUserState.name || storageUserState.name
    const username =reduxUserState.username || storageUserState.username

    useEffect(()=>{

    },[tagOpen])

    const handleCaption = (e)=>{
        if(e.target.value.length<=1000){
            setCaption(e.target.value)
        }
    }

  return (
    <div className='w-full h-[calc(100vh-80px)]  bg-white absolute left-[50%] -translate-x-[50%] flex items-center justify-center'>
        <div className='ml-10 mt-5 h-[20%] absolute top-0 left-0 bg-white flex items-center gap-3'>
            <img
        src={avatar}
        alt='user profile'
        className='object-contain w-[100px] h-full'
        />
        <div className='w-[80%]  flex  px-2 py-3'   >
            <div >
                <p className='text-2xl'>{name}</p>
                <p className='text-md'>@{username}</p>
            </div>
            
            <div className='ml-5 flex gap-3'>
                <i className='bx  bx-group   text-3xl cursor-pointer' 
                onClick={()=>{
                    setTagOpen(!tagOpen);
                    setVisibilityOpen(false)
                }}
                ></i> 
                <i className='bx  bx-eye-alt text-3xl cursor-pointer' 
                onClick={()=>{
                    setTagOpen(false);
                    setVisibilityOpen(!visibilityOpen)
                }}
                ></i> 
            </div>
            
        </div>
        </div>


        {/* to cancel the postCreation tab */}
        <div className='absolute top-5 right-4 '>
        <i className='bx  bx-x  text-5xl cursor-pointer' 
        onClick={()=>{setCreationTab("")}}
        ></i> 

        </div>

        <div className='w-[70%] h-1/2  py-10 relative bottom-20 left-10 '>
            <textarea
            className='resize-none bg-[#EDF2F4] rounded-3xl border-1 border-[#878a8b]/50 shadow-lg px-2 py-3 placeholder:text-lg focus:outline-none'
            value={caption}
            onChange={handleCaption}
            rows="14"
            cols="90"
            placeholder='write caption for your post'
            />
            <span className='absolute bottom-0 right-2 text-sm text-[#4a4c4d]'>{caption.length}/1000 characters</span>

            <div className='w-full  mt-5 flex items-center justify-center gap-50'>
                <div className='flex flex-col items-center justify-center'> 
                    <i className='bx  bx-image text-[#000] text-4xl' >
                    </i>
                    <p>Add Images</p>
                </div>
                <div className='flex flex-col items-center justify-center'>
                    <i className='bx  bx-video text-[#000] text-4xl' ></i>
                    <p> Add Videos</p>
                    </div>
                <div className='flex flex-col items-center justify-center'>
                    <i className='bx  bx-trip text-[#000] text-4xl' ></i>
                    <p className='text-center'>Add post to a Trip</p>
                </div>
                  
                   
                   
            </div>

        </div>

        


    </div>
  )
}

export default PostCreation