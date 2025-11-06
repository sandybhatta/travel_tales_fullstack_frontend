import React, { useRef, useState } from 'react'
import mainApi from '../Apis/axios'
import { useSelector } from 'react-redux'

const AddCaptionTab = ({handleFiles, visibilityStatus,setCreateModal,setCreationTab ,caption,setCaption,taggedUsers}) => {
    
    const imageRef=useRef()
    const videoRef=useRef()
    const location = useSelector(state=>state.user.location)

    const handleCaption = (e)=>{
        if(e.target.value.length<=1000){
            setCaption(e.target.value)
        }
    }
    const handleCaptionPost = async()=>{
       if(caption.length>0 ){

           try {
             await mainApi.post("/api/posts",{
                caption,
                location,
                taggedUsers,
                visibility:visibilityStatus
            })
            setCreationTab("")
            setCreateModal(false)
           } catch (error) {
            alert("post creating with only caption error")
           }
       }

    }
  return (
    <div className='w-[90%] h-[80%] mt-5 py-5  flex flex-col items-center justify-center '>

        <div className='w-full h-[65%] relative'>
            <textarea
            className='resize-none  bg-[#EDF2F4] rounded-3xl border-1 border-[#878a8b]/50 shadow-lg px-2 pt-3 pb-10 placeholder:text-lg   w-full  h-full focus:outline-none'
            value={caption}
            onChange={handleCaption}
            
            placeholder='write caption for your post'

            
            />
            <span className='absolute bottom-5 right-2 text-sm text-[#4a4c4d] mt-10'>{caption.length}/1000 characters</span>
        </div>
            
            

            <div className='w-full  mt-5 flex items-center justify-around '
            >
                <div className='cursor-pointer flex flex-col items-center justify-center ' 
                 onClick={()=>imageRef.current.click()}> 
                    <i className='bx  bx-image text-[#000] text-4xl' >
                    </i>
                    <p>Add Images</p>
                </div>

                <div className='cursor-pointer flex flex-col items-center justify-center '
                onClick={()=>videoRef.current.click()}
                >
                    <i className='bx  bx-video text-[#000] text-4xl' ></i>
                    <p> Add Videos</p>
                </div>

                <div className='flex flex-col items-center justify-center cursor-pointer'>
                    <i className='bx  bx-trip text-[#000] text-4xl' ></i>
                    <p className='text-center'>Add post to a Trip</p>
                </div>
               

                <button className='flex flex-col items-center justify-center cursor-pointer'
                disabled={caption.length===0}
                onClick={handleCaptionPost}
                >
                <i className='bx  bx-send text-[#000] text-4xl'></i> 
                    Post
                </button>
                  
                  <input
                  className='hidden'
                  type='file'
                  accept='image/*'
                  multiple
                  ref={imageRef}
                  onChange={(e)=>handleFiles(e.target.files)}
                  />

                  <input
                  className='hidden'
                  type='file'
                  accept='video/mp4'
                  multiple
                  ref={videoRef}
                  onChange={(e)=>handleFiles(e.target.files)}
                  />
                  
                   
                   
            </div>

        </div>
  )
}

export default AddCaptionTab