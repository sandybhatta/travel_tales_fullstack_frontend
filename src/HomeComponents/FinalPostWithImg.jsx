import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import VisibilityOfPost from './VisibilityOfPost'
import TagUsers from './TagUsers'
import mainApi from '../Apis/axios'

const FinalPostWithImg = ({caption, setCaption, files,visibilityStatus,setVisibilityStatus,visibilityOpen,setVisibilityOpen,setCreateModal,setCreationTab,tagOpen,setTagOpen , setNext}) => {
  const reduxUserState = useSelector(state=>state.user)
    const storageUserState = JSON.parse(localStorage.getItem("userInfo"))
    const avatar =reduxUserState.avatar || storageUserState.avatar
    const name =reduxUserState.name || storageUserState.name
    const username = reduxUserState.username || storageUserState.username
    const location= reduxUserState.location || storageUserState.location
    const [progress, setProgress] =useState(0)
    const [ isUploading ,setIsUploading ] = useState(false)


    const handlePost= async()=>{
      setIsUploading(true)
      const formData = new FormData() ;
      formData.append('caption',caption)
      formData.append('location',location)
      formData.append('visibility' , visibilityStatus)
      files.forEach(item => {
        formData.append('post',item.file)
      });

     try {
        let resp = await mainApi.post("/api/posts",formData,{
          onUploadProgress:(event)=>{
            let percent = Math.round((event.loaded * 100)/event.total)
            setProgress(percent)
          }
        })

        setIsUploading(false)
        setCreationTab("")
        setCreateModal(false)
     } catch (error) {
      console.log("post error")
      console.log(error?.response?.data?.message)
     }
      
    }
  return (
    <div className='w-full h-[calc(150vh-80px)] bg-white absolute top-0 left-0 flex flex-col gap-3 items-center justify-around px-10 py-5'>


    {
                    visibilityOpen && <VisibilityOfPost visibilityStatus={visibilityStatus} setVisibilityStatus={setVisibilityStatus} setVisibilityOpen={setVisibilityOpen} />
                }


<div className='h-[20%] w-full    flex items-center gap-3'>
            <img
        src={avatar}
        alt='user profile'
        className='object-contain w-[100px] h-full ml-2'
        />
        <div className='w-[80%]  flex  px-2 py-3'   >
            <div >
                <p className='text-2xl'>{name}</p>
                <p className='text-md'>@{username}</p>
            </div>
            
            <div className='ml-5 flex gap-3'>

                {/* tag a user */}
                <i className='bx  bx-user-plus relative group  text-3xl cursor-pointer' 
                onClick={()=>{
                    setTagOpen(!tagOpen);
                    setVisibilityOpen(false)
                }}
                >
                    <span className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   bg-black text-white text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-300 whitespace-nowrap'>Tag</span>
                    </i> 

                


                {/* set visibility */}
                <i className= {`bx  ${visibilityStatus === "public" ?"bx-community" : visibilityStatus === "followers" ? "bx-group" : visibilityStatus === "close_friends"? "bxs-user-check" :"bx-lock-keyhole"} text-3xl cursor-pointer  relative group `}
                onClick={()=>{
                    setTagOpen(false);
                    setVisibilityOpen(!visibilityOpen)
                }}
                >
                    <span className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   bg-black text-white text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-300 whitespace-nowrap'>Visibility</span></i> 

                {
                    tagOpen && <TagUsers/>
                }

              <div className='absolute top-5 right-4 '>
                  <i className='bx  bx-x  text-5xl cursor-pointer' 
                  onClick={()=>{setCreationTab("")}}
                  ></i> 

              </div>
               
            </div>
            
        </div>
        </div>


            {/* main caption */}
                    <div className='w-full h-[55%] relative'>
                        <textarea
                        className='resize-none  bg-[#EDF2F4] rounded-3xl border-1 border-[#878a8b]/50 shadow-lg px-2 pt-3 pb-10 placeholder:text-lg   w-full  h-full focus:outline-none'
                        value={caption}
                        onChange={(e)=>{
                            if(e.target.value.length<=1000){
                                setCaption(e.target.value)
                            }
                        }}
                        
                        placeholder='write caption for your post'

                        
                        />
                    <span className='absolute bottom-5 right-2 text-sm text-[#4a4c4d] mt-10'>{caption.length}/1000 characters</span>
                </div>
        {/* photo video section */}
        <div className='w-full h-auto md:h-[55%] flex flex-col md:flex-row flex-wrap justify-between items-center gap-3 px-0 md:px-10 py-4 shrink-0'>
                        {/* main photo */}
                        <div className='w-full md:w-1/2 h-[300px] md:h-full'>
                            {
                                files[0].type==="image"?
                                <img
                                src={files[0].url}
                                alt='image'
                                className='object-cover w-full h-full rounded-lg'
                                />:<video
                                src={files[0].url}
                                alt='video'
                                className='object-cover w-full h-full rounded-lg'
                                />
                            }
                        </div>


                            {
                              files.length>1 && <div className='w-full md:w-[40%] h-[200px] md:h-full flex flex-row md:flex-col flex-wrap justify-around items-center gap-2 '>

                              <div className={`${files.length===1 ?"display:none": files.length===2?"w-full h-full" : "w-1/2 md:w-full h-full md:h-[45%]"}`}>
                              {
                                  files[1].type==="image"?
                                  <img
                                  src={files[1]?.url}
                                  alt='image'
                                  className='object-contain h-full overflow-hidden'
                                  />:<video
                                  src={files[1]?.url}
                                  alt='video'
                                  className='object-contain h-full overflow-hidden'
                                  />
                              }
                          </div>
                            {
                              files.length>2 && <div className={`${files.length<=2 ?"display:none": "w-full h-[45%]"} relative overflow-hidden`}> 
                              {
                                      files[2].type==="image"?
                                      <img
                                      src={files[2]?.url}
                                      alt='image'
                                      className='object-cover '
                                      />:<video
                                      src={files[2]?.url}
                                      alt='video'
                                      className='object-cover'
                                      />
                                  } 
  
                                  {files.length>3 && <div className={`w-full h-full absolute bottom-0 left-0 flex items-center justify-center text-2xl text-white `}>
                                      <p>{files.length-3} more files</p>
                                  </div>}
                              </div>
                            }
                        </div>
                            }
                        
        </div>

        <div className='w-full h-[100px] absolute bottom-0 right-10 flex justify-center items-center gap-5'>
            <div
              onClick={()=>setNext(false)}
              className=' text-white bg-black px-3 py-2 flex items-center justify-center gap-2 rounded-lg cursor-pointer border-2 border-white'
              >
                 <i className='bx  bx-arrow-to-left-stroke text-3xl   text-white  cursor-pointer'></i> 
                Back
            
            </div>

            <div
            onClick={handlePost}
            className='bg-green-400 hover:bg-green-500 text-white px-3 py-2 flex items-center justify-center gap-2 rounded-lg cursor-pointer' 
            >
               <i className='bx  bx-send  text-3xl   text-white  '></i> 
              Post
            
            </div>
         
        </div>

                            {/* upload percentage */}
                            {isUploading && <div className='absolute top-0 w-screen h-[5px] bg-black'>
                              <div className={` w-[${progress}] h-full   
                              ${progress<50?"bg-red-400": progress<80 ? "bg-yellow-400" : "bg-green-400"}
                              ` } 
                              > </div>
                            </div>}
                            
        </div>
  )
}

export default FinalPostWithImg