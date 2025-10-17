import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import AddCaptionTab from './AddCaptionTab';
import PhotoEditor from './PhotoEditor';

const PostCreation = ({setCreationTab}) => {
    const [files,setFiles] = useState([])
   
    const[tagOpen,setTagOpen] = useState(false);
    const[visibilityOpen, setVisibilityOpen]=useState(false)


    const reduxUserState = useSelector(state=>state.user)
    const storageUserState = JSON.parse(localStorage.getItem("userInfo"))
    const avatar =reduxUserState.avatar || storageUserState.avatar
    const name =reduxUserState.name || storageUserState.name
    const username = reduxUserState.username || storageUserState.username


    const MAX_FILES = 20
    const MAX_FILE_SIZE = 100 * 1024 *1024 


    useEffect(()=>{

    },[tagOpen])

   
    const handleFiles = (newFiles)=>{
        if(files.length>20){
            return;
        }
        const incomingFiles = Array.from(newFiles);
        let media = [...files, ...incomingFiles]
        let toatalFileSize = media.reduce((acc,file)=>acc+file.size,0)

        if(toatalFileSize > MAX_FILE_SIZE){
            return;
        }

        if(media.length > MAX_FILES){
            media = media.slice(0,MAX_FILES)
        }

        media = media.map(file=> ({
            type:file.type.startsWith('image')?"image":"video",
            url:URL.createObjectURL(file),
            size:file.size,
        }))

        setFiles(media)

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

        { files && files.length>0?<PhotoEditor files={files} setFiles ={setFiles} />: <AddCaptionTab handleFiles={handleFiles}/>}

        


    </div>
  )
}

export default PostCreation