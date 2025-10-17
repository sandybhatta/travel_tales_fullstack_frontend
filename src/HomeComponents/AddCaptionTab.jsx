import React, { useRef, useState } from 'react'

const AddCaptionTab = ({handleFiles}) => {
    const[caption,setCaption]=useState("")
    const imageRef=useRef()
    const videoRef=useRef()

    const handleCaption = (e)=>{
        if(e.target.value.length<=1000){
            setCaption(e.target.value)
        }
    }
  return (
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

            <div className='w-full  mt-5 flex items-center justify-center gap-50'
            >
                <div className='cursor-pointer flex flex-col items-center justify-center' 
                 onClick={()=>imageRef.current.click()}> 
                    <i className='bx  bx-image text-[#000] text-4xl' >
                    </i>
                    <p>Add Images</p>
                </div>

                <div className='cursor-pointer flex flex-col items-center justify-center'
                onClick={()=>videoRef.current.click()}
                >
                    <i className='bx  bx-video text-[#000] text-4xl' ></i>
                    <p> Add Videos</p>
                    </div>
                <div className='flex flex-col items-center justify-center'>
                    <i className='bx  bx-trip text-[#000] text-4xl' ></i>
                    <p className='text-center'>Add post to a Trip</p>
                </div>
                  
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